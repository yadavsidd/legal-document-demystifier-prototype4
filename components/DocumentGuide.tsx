import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { GuideMessage } from '../types';
import { getDocumentGuideStream } from '../services/geminiService';
import Loader from './shared/Loader';

// A component to render the AI's markdown response using a proper library
const AiMarkdownContent: React.FC<{ content: string }> = ({ content }) => {
    if (!content) return null;
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
};


const DocumentGuide: React.FC = () => {
    const [messages, setMessages] = useState<GuideMessage[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);
    
    // Auto-resize textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [input]);

    const handleSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        const topic = input.trim();
        if (!topic || isLoading) return;

        const newUserMessage: GuideMessage = { role: 'user', content: topic };
        setMessages(prev => [...prev, newUserMessage, { role: 'model', content: '' }]);
        setInput('');
        setIsLoading(true);
        setError('');

        try {
            const stream = await getDocumentGuideStream(topic);
            for await (const chunk of stream) {
                const chunkText = chunk.text ?? '';
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content += chunkText;
                    return newMessages;
                });
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
             // Remove the empty model message on error
             setMessages(prev => prev.slice(0, prev.length -1));
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading]);

    const handleExampleClick = (prompt: string) => {
        setInput(''); // clear input before setting new messages
        const newUserMessage: GuideMessage = { role: 'user', content: prompt };
        setMessages(prev => [...prev, newUserMessage, { role: 'model', content: '' }]);
        setIsLoading(true);
        setError('');

        getDocumentGuideStream(prompt)
            .then(async (stream) => {
                 for await (const chunk of stream) {
                    const chunkText = chunk.text ?? '';
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].content += chunkText;
                        return newMessages;
                    });
                }
            })
            .catch(err => {
                 setError(err.message || 'An unknown error occurred.');
                 setMessages(prev => prev.slice(0, prev.length -1));
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const examplePrompts = ["How to get a driver's license", "What is needed for a rental agreement"];

    return (
        <div className="animate-fade-in flex flex-col h-full">
            <div className="flex-1 overflow-y-auto flex flex-col">
                {messages.length === 0 && !isLoading ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                         <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center font-bold text-white text-2xl mb-4">GM</div>
                         <h1 className="text-2xl font-bold font-display text-base-900 dark:text-white">Good Man</h1>
                         <p className="text-base-600 dark:text-base-400 mt-2">How can I help you today?</p>
                          <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-2">
                            {examplePrompts.map(p => (
                                 <button key={p} onClick={() => handleExampleClick(p)} className="px-4 py-2 text-sm bg-base-100 hover:bg-base-200 dark:bg-base-800/50 dark:hover:bg-base-700/50 text-base-700 dark:text-base-300 rounded-lg border border-base-200 dark:border-base-700 transition-colors">
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-auto w-full">
                        {messages.map((msg, index) => (
                            <div key={index} className={`py-6 px-4 ${msg.role === 'model' ? 'bg-base-100 dark:bg-base-800/50' : ''}`}>
                                <div className="max-w-3xl mx-auto flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-base-200 dark:bg-base-700 flex items-center justify-center font-semibold">
                                         {msg.role === 'user' ? 'You' : <span className="text-primary-500 font-bold">GM</span>}
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        {msg.role === 'model' ? (
                                            <AiMarkdownContent content={msg.content} />
                                        ) : (
                                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                        {msg.role === 'model' && !msg.content && isLoading && index === messages.length - 1 && <Loader />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>

            <div className="px-4 pb-2 pt-4 bg-base-50/80 dark:bg-base-950/80 backdrop-blur-sm border-t border-base-200 dark:border-base-800">
                {error && <p className="mb-2 text-center text-sm text-red-500 dark:text-red-400">{error}</p>}
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-end space-x-2">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about a legal process, e.g., 'How to create a will'"
                        className="flex-1 p-3 border border-base-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-base-800 dark:border-base-700 dark:placeholder-base-400 dark:text-white transition resize-none"
                        rows={1}
                        disabled={isLoading}
                    />
                     <button
                        type="submit"
                        disabled={isLoading || !input}
                        className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-primary-600 text-white rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-base-950 focus:ring-primary-500 disabled:bg-base-400 dark:disabled:bg-base-600 disabled:cursor-not-allowed transition-all"
                        aria-label="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DocumentGuide;