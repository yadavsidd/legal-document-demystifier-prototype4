import { GoogleGenAI, Type, Part, GenerateContentResponse } from "@google/genai";
import type { DocumentAnalysis, SimplifiedForm, DocumentTranslation } from '../types';

// FIX: Reverted to using process.env.API_KEY to adhere to coding guidelines, which require
// the API key to be sourced exclusively from this environment variable. This also
// resolves the TypeScript error with `import.meta.env`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const model = "gemini-2.5-flash";

export const analyzeDocument = async (documentText: string, filePart?: Part): Promise<DocumentAnalysis> => {
    try {
        const prompt = `Analyze the provided legal document (which may be text, an image, or a PDF).
1.  First, extract the full text from the document. If the input is already text, use it as is.
2.  Based on the full extracted text, provide a concise summary of the document's purpose and key terms in english.
3.  List any clauses or terms that could cause future problems or are red flags. For each, provide the original text of the clause and a description of the issue.
4.  List all important dates, deadlines, or time-sensitive events mentioned.
5.  Identify the most important clauses or sections. For each, provide the original text of the clause, a simple explanation of what it means, and rate its importance ('High', 'Medium', or 'Low').
6.  Provide an array of the exact, most critical phrases or sentences from the text to be used for highlighting.
7.  Finally, return the complete, extracted text of the entire document.

Document text (if provided directly from a text area, use as additional context):
---
${documentText}
---
`;
        const parts: Part[] = [];
        if (filePart) {
            parts.push(filePart);
        }
        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model,
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: {
                            type: Type.STRING,
                            description: "A concise summary of the document's purpose and key terms."
                        },
                        potentialIssues: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    clause: { type: Type.STRING, description: "The exact text of the clause with a potential issue." },
                                    issue: { type: Type.STRING, description: "A description of the potential problem with this clause." }
                                },
                                required: ["clause", "issue"]
                            },
                            description: "A list of clauses or terms that could cause problems, with explanations."
                        },
                        timeline: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of all important dates, deadlines, or time-sensitive events mentioned."
                        },
                        keyClauses: {
                            type: Type.ARRAY,
                            description: "An array of key clauses with their explanations and importance.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    clause: {
                                        type: Type.STRING,
                                        description: "The original text of the key clause."
                                    },
                                    explanation: {
                                        type: Type.STRING,
                                        description: "A simple explanation of the clause."
                                    },
                                    importance: {
                                        type: Type.STRING,
                                        enum: ['High', 'Medium', 'Low'],
                                        description: "The importance level of the clause."
                                    }
                                },
                                required: ["clause", "explanation", "importance"]
                            }
                        },
                        highlights: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of exact phrases or sentences from the text that are most critical to understand, to be used for highlighting."
                        },
                        extractedText: {
                            type: Type.STRING,
                            description: "The full text extracted from the document. If the input was plain text, this should be the same as the input text."
                        }
                    },
                    required: ["summary", "potentialIssues", "timeline", "keyClauses", "highlights", "extractedText"]
                },
            },
        });

        const jsonString = (response.text ?? '').trim();
        return JSON.parse(jsonString) as DocumentAnalysis;

    } catch (error) {
        console.error("Error analyzing document:", error);
        throw new Error("Failed to analyze the document. The AI service may be unavailable or the document format is unsupported.");
    }
};


export const suggestClauseFix = async (clauseText: string, issueContext: string): Promise<{ suggestedFix: string; explanation: string; }> => {
    try {
        const prompt = `You are an expert legal assistant. A user has a legal clause with a potential issue. Your task is to rewrite the clause to resolve the issue while preserving the original intent as much as possible.

**Original Clause:**
---
${clauseText}
---

**Identified Issue/Context:**
---
${issueContext}
---

Please provide a rewritten version of the clause. Also, provide a brief explanation for why you made the changes you did. Return only the revised text and your explanation.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedFix: {
                            type: Type.STRING,
                            description: "The rewritten, improved version of the legal clause."
                        },
                        explanation: {
                             type: Type.STRING,
                             description: "A brief explanation of why the suggested fix is an improvement."
                        }
                    },
                    required: ["suggestedFix", "explanation"]
                },
            },
        });

        const jsonString = (response.text ?? '').trim();
        return JSON.parse(jsonString) as { suggestedFix: string; explanation: string };

    } catch (error) {
        console.error("Error suggesting clause fix:", error);
        throw new Error("Failed to generate a suggestion. The AI service may be unavailable.");
    }
};

export const getDocumentGuideStream = async (topic: string): Promise<AsyncGenerator<GenerateContentResponse>> => {
    try {
        const prompt = `As an AI assistant named "Good Man", provide a guide for the following legal document or process: "${topic}". Structure your response in markdown with the following sections using '###' for headings: "### Required Documents", "### Step-by-Step Process", and "### What to Avoid". Use unordered lists with '*' for items in each section.`;
        
        return ai.models.generateContentStream({
            model,
            contents: prompt,
        });

    } catch (error) {
        console.error("Error getting document guide stream:", error);
        throw new Error("Failed to generate the guide. The streaming service may be unavailable.");
    }
};


export const simplifyForm = async (formText: string, filePart?: Part): Promise<SimplifiedForm> => {
    try {
         const prompt = `Simplify the provided form (which may be text, an image, or a PDF).
1. First, extract the full text from the form document if one is provided.
2. Analyze the extracted text (or the provided text input if no file is present).
3. For each field or section, provide the original text, a simple explanation of what it means, what kind of information is required, and why that information is typically needed for this type of form.

Form text (if provided directly from a text area, use as additional context):
---
${formText}
---
`;
        const parts: Part[] = [];
        if (filePart) {
            parts.push(filePart);
        }
        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model,
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            originalText: {
                                type: Type.STRING,
                                description: "The exact text from the form for a specific field or section."
                            },
                            explanation: {
                                type: Type.STRING,
                                description: "A simple, easy-to-understand explanation of what this field means."
                            },
                            requiredInfo: {
                                type: Type.STRING,
                                description: "A description of the data that should be entered in this field."
                            },
                            whyItsNeeded: {
                                type: Type.STRING,
                                description: "An explanation of why this information is necessary for the form."
                            }
                        },
                        required: ["originalText", "explanation", "requiredInfo", "whyItsNeeded"]
                    },
                },
            },
        });
        
        const jsonString = (response.text ?? '').trim();
        return JSON.parse(jsonString) as SimplifiedForm;

    } catch (error) {
        // FIX: Added missing curly braces to the catch block to fix a syntax error.
        console.error("Error simplifying form:", error);
        throw new Error("Failed to simplify the form. Please check the input text and try again.");
    }
};

export const translateDocument = async (documentText: string, targetLanguage: string, filePart?: Part): Promise<DocumentTranslation> => {
    try {
        const prompt = `Translate the provided document (which may be text, an image, or a PDF) into the target language.
1. First, extract the full text from the document. If the input is already text, use it as is.
2. Translate the entire extracted text into ${targetLanguage}.
3. Return only the translated text.

Document text (if provided directly from a text area, use as additional context):
---
${documentText}
---
`;
        const parts: Part[] = [];
        if (filePart) {
            parts.push(filePart);
        }
        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model,
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        translatedText: {
                            type: Type.STRING,
                            description: `The full document text translated into ${targetLanguage}.`
                        },
                    },
                    required: ["translatedText"]
                },
            },
        });

        const jsonString = (response.text ?? '').trim();
        return JSON.parse(jsonString) as DocumentTranslation;

    } catch (error) {
        console.error("Error translating document:", error);
        throw new Error("Failed to translate the document. The AI service may be unavailable or the document/language is unsupported.");
    }
};