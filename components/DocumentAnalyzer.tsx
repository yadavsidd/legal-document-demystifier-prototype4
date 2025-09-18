import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { Part } from '@google/genai';
import type { DocumentAnalysis, ClauseExplanation, PotentialIssue } from '../types';
import { analyzeDocument, suggestClauseFix } from '../services/geminiService';
import Loader from './shared/Loader';
import Card from './shared/Card';

// Helper for file type icons
const FileIcon: React.FC<{ type: string }> = ({ type }) => {
    if (type.includes('pdf')) {
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-500"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10.3 12.3a2.4 2.4 0 0 1 3.4 0 2.4 2.4 0 0 1 0 3.4 2.4 2.4 0 0 1-3.4 0 2.4 2.4 0 0 1 0-3.4Z"/><path d="M4 12V4a2 2 0 0 1 2-2h8l6 6v2"/><path d="M2 18h2"/><path d="M5 18h2"/><path d="M8 18h2"/></svg>;
    }
    if (type.includes('image')) {
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
    }
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-base-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
};

// Accordion component for results
const Accordion: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, icon, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-base-200 dark:border-base-700 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-base-800 dark:text-base-200 hover:bg-base-100 dark:hover:bg-base-800 transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center">
                    {icon}
                    <span className="ml-3">{title}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-full' : 'max-h-0'}`}>
                <div className="p-4 pl-12 text-base-600 dark:text-base-400">
                    {children}
                </div>
            </div>
        </div>
    );
};

const SuggestionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    isLoading: boolean;
    content: { original: string; suggestion: string; explanation: string; } | null;
}> = ({ isOpen, onClose, onAccept, isLoading, content }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-base-800 rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold font-display text-base-900 dark:text-white mb-4 flex-shrink-0">Suggested Fix</h2>
                <div className="overflow-y-auto pr-2 flex-grow">
                    {isLoading || !content ? <Loader /> : (
                        <div className="space-y-4">
                             <div>
                                <p className="font-semibold text-red-600 dark:text-red-400 text-sm mb-1">Original Clause:</p>
                                <p className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-900 dark:text-red-200 whitespace-pre-wrap">{content.original}</p>
                            </div>
                            {content.explanation && (
                                <div>
                                    <p className="font-semibold text-yellow-600 dark:text-yellow-400 text-sm mb-1">AI's Explanation:</p>
                                    <p className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-900 dark:text-yellow-200">{content.explanation}</p>
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-green-600 dark:text-green-400 text-sm mb-1">Suggested Revision:</p>
                                <p className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-900 dark:text-green-200 whitespace-pre-wrap">{content.suggestion}</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end space-x-3 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-base-200 dark:bg-base-700 text-base-800 dark:text-base-200 rounded-lg hover:bg-base-300 dark:hover:bg-base-600 transition-colors">Cancel</button>
                    <button onClick={onAccept} disabled={isLoading || !content} className="px-4 py-2 text-sm font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-base-400 dark:disabled:bg-base-600 transition-colors">Accept Suggestion</button>
                </div>
            </div>
        </div>
    );
};

const ImportanceBadge: React.FC<{ level: 'High' | 'Medium' | 'Low' }> = ({ level }) => {
    const levelColors = {
        High: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    };
    return (
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${levelColors[level]}`}>
            {level} Importance
        </span>
    );
};

// Simple LCS based diffing utility
const computeDiff = (original: string, modified: string) => {
    const originalWords = original.split(/(\s+)/);
    const modifiedWords = modified.split(/(\s+)/);
    const n = originalWords.length;
    const m = modifiedWords.length;
    const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (originalWords[i - 1] === modifiedWords[j - 1]) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    const diff = { original: [] as any[], modified: [] as any[] };
    let i = n, j = m;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && originalWords[i - 1] === modifiedWords[j - 1]) {
            diff.original.unshift({ type: 'same', value: originalWords[i - 1] });
            diff.modified.unshift({ type: 'same', value: modifiedWords[j - 1] });
            i--; j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            diff.modified.unshift({ type: 'added', value: modifiedWords[j - 1] });
            j--;
        } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
            diff.original.unshift({ type: 'removed', value: originalWords[i - 1] });
            i--;
        }
    }
    return diff;
};

const DiffViewer: React.FC<{ originalText: string, editedText: string }> = ({ originalText, editedText }) => {
    const diff = useMemo(() => computeDiff(originalText, editedText), [originalText, editedText]);

    const renderDiff = (parts: { type: string, value: string }[]) => (
        <p className="whitespace-pre-wrap leading-relaxed text-sm">
            {parts.map((part, index) => {
                if (part.type === 'added') {
                    return <span key={index} className="bg-green-100 dark:bg-green-900/50 rounded">{part.value}</span>;
                }
                if (part.type === 'removed') {
                    return <span key={index} className="bg-red-100 dark:bg-red-900/50 rounded line-through">{part.value}</span>;
                }
                return <span key={index}>{part.value}</span>;
            })}
        </p>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
                <h4 className="font-semibold text-base-800 dark:text-base-200 mb-2">Original Document</h4>
                <div className="p-3 border rounded-lg bg-base-50 dark:bg-base-900/50 dark:border-base-700 h-full max-h-[400px] overflow-y-auto">
                    {renderDiff(diff.original)}
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-base-800 dark:text-base-200 mb-2">Edited Document</h4>
                <div className="p-3 border rounded-lg bg-base-50 dark:bg-base-900/50 dark:border-base-700 h-full max-h-[400px] overflow-y-auto">
                    {renderDiff(diff.modified)}
                </div>
            </div>
        </div>
    );
};


const DocumentAnalyzer: React.FC = () => {
    const [documentText, setDocumentText] = useState<string>('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [originalExtractedText, setOriginalExtractedText] = useState<string>('');
    const [editableText, setEditableText] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<{ original: string; suggestion: string; explanation: string; } | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);

    const fileToGenerativePart = async (file: File): Promise<Part> => {
        const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result.split(',')[1]);
                } else {
                    reject(new Error("Failed to read file as data URL."));
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });

        const data = await base64EncodedDataPromise;
        return { inlineData: { data, mimeType: file.type } };
    };
    
    const resetState = () => {
        setError('');
        setAnalysis(null);
        setEditableText('');
        setOriginalExtractedText('');
    };

    const handleFileChange = (files: FileList | null) => {
        const file = files?.[0];
        if (file) {
            resetState();
            setUploadedFile(file);
            if (file.type.startsWith('text/')) {
                 const reader = new FileReader();
                reader.onload = (e) => { setDocumentText(e.target?.result as string); };
                reader.readAsText(file);
            }
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!documentText.trim() && !uploadedFile) {
            setError('Please paste text or upload a document to analyze.');
            return;
        }
        setIsLoading(true);
        resetState();
        try {
            const filePart = uploadedFile ? await fileToGenerativePart(uploadedFile) : undefined;
            const result = await analyzeDocument(documentText, filePart);
            setAnalysis(result);
            setEditableText(result.extractedText);
            setOriginalExtractedText(result.extractedText);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [documentText, uploadedFile]);

    const handleSuggestFix = useCallback(async (clause: string, context: string) => {
        setModalContent({ original: clause, suggestion: '', explanation: '' });
        setIsModalOpen(true);
        setIsSuggesting(true);
        try {
            const result = await suggestClauseFix(clause, context);
            setModalContent({ original: clause, suggestion: result.suggestedFix, explanation: result.explanation });
        } catch (err: any) {
            setModalContent(prev => prev ? { ...prev, suggestion: `Error: ${err.message}`, explanation: 'Could not generate explanation due to an error.' } : null);
        } finally {
            setIsSuggesting(false);
        }
    }, []);

    const handleAcceptSuggestion = useCallback(() => {
        if (modalContent) {
            setEditableText(prev => prev.replace(modalContent.original, modalContent.suggestion));
            setIsModalOpen(false);
            setModalContent(null);
        }
    }, [modalContent]);
    
    const handleDownload = () => {
        const blob = new Blob([editableText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `edited-document.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    const renderHighlightedText = (text: string, highlights: string[]) => {
        const validHighlights = highlights?.filter(h => h && h.trim() !== '') || [];
        if (validHighlights.length === 0 || !text) {
            return <p className="whitespace-pre-wrap leading-relaxed">{text}</p>;
        }
        
        const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${validHighlights.map(escapeRegExp).join('|')})`, 'gi');
        const parts = text.split(regex);

        return (
            <p className="whitespace-pre-wrap leading-relaxed">
                {parts.map((part, i) =>
                    i % 2 === 1 ? (
                        <mark key={i} className="bg-primary-200 dark:bg-primary-800/50 rounded px-1 text-primary-900 dark:text-primary-100">
                            {part}
                        </mark>
                    ) : ( <span key={i}>{part}</span> )
                )}
            </p>
        );
    };
    
    const dropHandler = (ev: React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        setIsDragOver(false);
        handleFileChange(ev.dataTransfer.files);
    };
    
    return (
        <div className="space-y-8 animate-fade-in">
            <SuggestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAccept={handleAcceptSuggestion} isLoading={isSuggesting} content={modalContent} />
            <div>
                <h1 className="text-3xl font-bold font-display text-base-900 dark:text-white">Document Analyzer</h1>
                <p className="text-base-600 dark:text-base-400 mt-1">Upload or paste document text to get a detailed AI-powered analysis.</p>
            </div>
            
            <Card>
                 <div className="flex flex-col">
                    <div 
                        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg h-48 transition-colors ${isDragOver ? 'border-primary-500 bg-primary-950/20' : 'border-base-300 dark:border-base-600 hover:border-primary-400'}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={dropHandler}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-base-400"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><path d="M18 8V2l-4 4"/><path d="M15 11h-1a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2Z"/></svg>
                        <p className="mt-2 text-base-600 dark:text-base-400 text-center">
                           <button onClick={() => fileInputRef.current?.click()} className="font-semibold text-primary-500 hover:text-primary-400 focus:outline-none focus:underline">Click to upload</button> or drag and drop
                        </p>
                         <p className="text-xs text-base-500 mt-1">PDF, JPG, TXT, or MD</p>
                        <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept=".txt,.md,.pdf,.jpg,.jpeg" />
                    </div>

                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-base-300 dark:border-base-700"></div>
                        <span className="flex-shrink mx-4 text-base-500 dark:text-base-400 font-semibold">OR</span>
                        <div className="flex-grow border-t border-base-300 dark:border-base-700"></div>
                    </div>

                    <div>
                         <label htmlFor="document-text-area" className="block text-sm font-medium text-base-700 dark:text-base-300 mb-2">
                            Paste Document Text
                        </label>
                        <textarea
                            id="document-text-area"
                            value={documentText}
                            onChange={(e) => { setDocumentText(e.target.value); resetState(); }}
                            placeholder="Paste your legal document text here..."
                            className="w-full h-64 p-4 border border-base-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-base-700 dark:border-base-600 dark:placeholder-base-400 dark:text-white transition"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {uploadedFile && (
                    <div className="mt-4 p-3 bg-base-100 dark:bg-base-700/50 rounded-lg flex justify-between items-center text-sm transition-all animate-fade-in">
                        <div className="flex items-center gap-3">
                             <FileIcon type={uploadedFile.type} />
                            <span className="text-base-700 dark:text-base-300 font-medium truncate">{uploadedFile.name}</span>
                        </div>
                        <button 
                            onClick={() => { setUploadedFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; resetState(); }} 
                            className="ml-2 text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                            aria-label="Remove selected file"
                        > &times; </button>
                    </div>
                )}
                
                <div className="mt-6 flex items-center justify-between">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || (!documentText && !uploadedFile)}
                        className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-base-800 focus:ring-primary-500 disabled:bg-base-400 dark:disabled:bg-base-600 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Document'}
                    </button>
                    {isLoading && <Loader />}
                </div>
                 {error && <p className="mt-4 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}
            </Card>

            {analysis && (
                <Card className="animate-fade-in space-y-2">
                     <Accordion title="Summary" defaultOpen={true} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary-500"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>}>
                       <p className="leading-relaxed">{analysis.summary}</p>
                    </Accordion>
                    
                    <Accordion title="Potential Issues & Red Flags" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>}>
                        <div className="space-y-4">
                            {analysis.potentialIssues.map((item, i) => (
                                <div key={i} className="p-4 border-l-4 border-red-500 bg-base-50 dark:bg-base-900/30 rounded-r-lg space-y-3">
                                    <div>
                                        <p className="font-semibold text-red-600 dark:text-red-400 text-xs">Issue:</p>
                                        <p className="mt-1 text-base-700 dark:text-base-300 text-sm">{item.issue}</p>
                                    </div>
                                    <blockquote className="text-base-800 dark:text-base-200 italic text-sm border-l-2 border-base-300 dark:border-base-700 pl-3">
                                        "{item.clause}"
                                    </blockquote>
                                    <button onClick={() => handleSuggestFix(item.clause, item.issue)} className="text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">Suggest Fix &rarr;</button>
                                </div>
                            ))}
                        </div>
                    </Accordion>

                    {analysis.keyClauses && analysis.keyClauses.length > 0 && (
                        <Accordion title="Key Clauses Explained" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-yellow-500"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>}>
                           <div className="space-y-4">
                                {analysis.keyClauses.map((item, index) => (
                                    <div key={index} className="p-4 border-l-4 border-primary-500 bg-base-50 dark:bg-base-900/30 rounded-r-lg space-y-3">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-base-500 dark:text-base-400 text-xs">Original Clause:</p>
                                            <ImportanceBadge level={item.importance} />
                                        </div>
                                        <blockquote className="text-base-800 dark:text-base-200 italic text-sm border-l-2 border-base-300 dark:border-base-700 pl-3">
                                            "{item.clause}"
                                        </blockquote>
                                        <div>
                                            <p className="font-semibold text-green-600 dark:text-green-400 text-xs">Explanation:</p>
                                            <p className="mt-1 text-base-700 dark:text-base-300 text-sm">{item.explanation}</p>
                                        </div>
                                        <button onClick={() => handleSuggestFix(item.clause, item.explanation)} className="text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">Suggest Fix &rarr;</button>
                                    </div>
                                ))}
                            </div>
                        </Accordion>
                    )}

                    <Accordion title="Timeline & Deadlines" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M12 22V2"/></svg>}>
                        <ul className="list-disc list-outside space-y-2 pl-5">
                           {analysis.timeline.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </Accordion>
                    
                    <Accordion title="Edit & Download Document" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="editable-document-area" className="block text-sm font-medium text-base-700 dark:text-base-300 mb-2">
                                    Live Editor
                                </label>
                                <textarea
                                    id="editable-document-area"
                                    value={editableText}
                                    onChange={(e) => setEditableText(e.target.value)}
                                    placeholder="Your document text will appear here for editing..."
                                    className="w-full h-64 p-4 border border-base-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-base-700 dark:border-base-600 dark:placeholder-base-400 dark:text-white transition"
                                />
                            </div>
                            <DiffViewer originalText={originalExtractedText} editedText={editableText} />
                            <button onClick={handleDownload} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-base-800 focus:ring-green-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                Download .txt
                            </button>
                        </div>
                    </Accordion>

                     <Accordion title="Original Text with Highlights" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-base-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>}>
                        <div className="p-4 border rounded-lg bg-base-50 dark:bg-base-900/50 dark:border-base-700 text-base-700 dark:text-base-300 max-h-[400px] overflow-y-auto">
                             {renderHighlightedText(analysis.extractedText, analysis.highlights)}
                        </div>
                    </Accordion>
                </Card>
            )}
        </div>
    );
};

export default DocumentAnalyzer;