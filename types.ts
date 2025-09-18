
export type FeatureKey = 'home' | 'analyzer' | 'guide' | 'simplifier' | 'translator';

export interface ClauseExplanation {
  clause: string;
  explanation: string;
  importance: 'High' | 'Medium' | 'Low';
}

export interface PotentialIssue {
  clause: string;
  issue: string;
}

export interface DocumentAnalysis {
  summary: string;
  potentialIssues: PotentialIssue[];
  timeline: string[];
  highlights: string[];
  extractedText: string;
  keyClauses: ClauseExplanation[];
}

export interface DocumentGuide {
  requiredDocuments: string[];
  steps: string[];
  whatToAvoid: string[];
}

// Updated GuideMessage to support a simple streaming text response.
export type GuideMessage = {
  role: 'user' | 'model';
  content: string; // User's prompt, or the model's streaming markdown response
};

export interface SimplifiedFormField {
  originalText: string;
  explanation: string;
  requiredInfo: string;
  whyItsNeeded: string;
}

export type SimplifiedForm = SimplifiedFormField[];

export interface DocumentTranslation {
    translatedText: string;
}
