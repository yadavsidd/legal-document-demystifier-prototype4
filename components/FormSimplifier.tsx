import React, { useState, useCallback, useRef } from 'react';
import type { Part } from '@google/genai';
import type { SimplifiedForm } from '../types';
import { simplifyForm } from '../services/geminiService';
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
    // Fallback/Text generic file icon
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
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
                <div className="p-4 pl-12 text-base-600 dark:text-base-400">
                    {children}
                </div>
            </div>
        </div>
    );
};


const SimplifiedResult: React.FC<{ result: SimplifiedForm }> = ({ result }) => (
    <div className="space-y-4">
        {result.map((field, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-x-4 p-3 border-l-4 border-primary-500 bg-base-50 dark:bg-base-900/30 rounded-r-lg">
                <div className="border-b md:border-b-0 md:border-r border-base-200 dark:border-base-700 pb-3 md:pb-0 md:pr-4">
                    <p className="font-semibold text-base-500 dark:text-base-400 text-xs">Original Text:</p>
                    <blockquote className="mt-1 text-base-800 dark:text-base-200 italic text-sm">"{field.originalText}"</blockquote>
                </div>
                <div className="space-y-2 pt-3 md:pt-0">
                    <div>
                        <p className="font-semibold text-green-600 dark:text-green-400 text-xs">Explanation:</p>
                        <p className="text-base-700 dark:text-base-300 text-sm">{field.explanation}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-blue-600 dark:text-blue-400 text-xs">What to Enter:</p>
                        <p className="text-base-700 dark:text-base-300 text-sm">{field.requiredInfo}</p>
                    </div>
                     {field.whyItsNeeded && (
                        <div>
                            <p className="font-semibold text-purple-600 dark:text-purple-400 text-xs">Why It's Needed:</p>
                            <p className="text-base-700 dark:text-base-300 text-sm">{field.whyItsNeeded}</p>
                        </div>
                    )}
                </div>
            </div>
        ))}
    </div>
);

const FormSimplifier: React.FC = () => {
    const [formText, setFormText] = useState<string>('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [result, setResult] = useState<SimplifiedForm | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        setResult(null);
    };

    const handleFileChange = (files: FileList | null) => {
        const file = files?.[0];
        if (file) {
            resetState();
            setUploadedFile(file);
            if (file.type.startsWith('text/')) {
                 const reader = new FileReader();
                reader.onload = (e) => { setFormText(e.target?.result as string); };
                reader.readAsText(file);
            }
        }
    };

    const handleSimplify = useCallback(async () => {
        if (!formText.trim() && !uploadedFile) {
            setError('Please paste form text or upload a document to simplify.');
            return;
        }
        setIsLoading(true);
        resetState();
        try {
            const filePart = uploadedFile ? await fileToGenerativePart(uploadedFile) : undefined;
            const simplifiedResult = await simplifyForm(formText, filePart);
            setResult(simplifiedResult);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [formText, uploadedFile]);
    
    const dropHandler = (ev: React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        setIsDragOver(false);
        handleFileChange(ev.dataTransfer.files);
    };
    
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold font-display text-base-900 dark:text-white">Form Simplifier</h1>
                <p className="text-base-600 dark:text-base-400 mt-1">Paste form text or upload a document, and I'll break it down for you field by field.</p>
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
                         <label htmlFor="form-text-area" className="block text-sm font-medium text-base-700 dark:text-base-300 mb-2">
                            Paste Form Text
                        </label>
                        <textarea
                            id="form-text-area"
                            value={formText}
                            onChange={(e) => { setFormText(e.target.value); resetState(); }}
                            placeholder="Paste your form text here..."
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
                        onClick={handleSimplify}
                        disabled={isLoading || (!formText && !uploadedFile)}
                        className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-base-800 focus:ring-primary-500 disabled:bg-base-400 dark:disabled:bg-base-600 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        {isLoading ? 'Simplifying...' : 'Simplify Form'}
                    </button>
                    {isLoading && <Loader />}
                </div>
                 {error && <p className="mt-4 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}
            </Card>

            {result && (
                <Card className="animate-fade-in space-y-2">
                     <Accordion title="Simplified Breakdown" defaultOpen={true} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}>
                       <SimplifiedResult result={result} />
                    </Accordion>
                </Card>
            )}
        </div>
    );
};

export default FormSimplifier;