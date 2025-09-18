

import React, { useState, useEffect } from 'react';
import type { FeatureKey } from './types';
import DocumentAnalyzer from './components/DocumentAnalyzer';
import DocumentGuide from './components/DocumentGuide';
import FormSimplifier from './components/FormSimplifier';
import DocumentTranslator from './components/DocumentTranslator';
import Home from './components/Home';
import GlobalLoader from './components/shared/GlobalLoader';

// --- Reusable Icon Components (Aceternity Inspired) ---
const AnalyzerIcon = ({ className = "h-5 w-5" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="m13.25 16.25 2.25 2.25"/></svg>;
const GuideIcon = ({ className = "h-5 w-5" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const SimplifierIcon = ({ className = "h-5 w-5" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const TranslatorIcon = ({ className = "h-5 w-5" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
const AppLogo = ({className = "h-8 w-8"}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;

// FIX: Changed icon type to React.ReactElement<{ className?: string }> to be more specific about the props,
// allowing `className` to be passed via `React.cloneElement` without type errors.
const features: { key: FeatureKey; name: string; description: string; component: React.ReactNode; icon: React.ReactElement<{ className?: string }> }[] = [
    { key: 'analyzer', name: 'Document Analyzer', description: 'Upload text for a detailed AI-powered summary, issue spotting, and timeline analysis.', component: <DocumentAnalyzer />, icon: <AnalyzerIcon /> },
    { key: 'guide', name: 'Document Guide', description: 'Get clear, step-by-step guidance on creating any legal document or navigating a legal process.', component: <DocumentGuide />, icon: <GuideIcon /> },
    { key: 'simplifier', name: 'Form Simplifier', description: 'Get a simple, field-by-field explanation of any confusing application, agreement, or form.', component: <FormSimplifier />, icon: <SimplifierIcon /> },
    { key: 'translator', name: 'Doc Translator', description: 'Translate documents into a wide variety of languages with AI-powered accuracy.', component: <DocumentTranslator />, icon: <TranslatorIcon /> },
];

const App: React.FC = () => {
    const [activeFeature, setActiveFeature] = useState<FeatureKey>('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (systemPrefersDark) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const renderContent = () => {
        if (activeFeature === 'home') {
             return <Home setActiveFeature={setActiveFeature} features={features} />;
        }
        const feature = features.find(f => f.key === activeFeature);
        return feature ? feature.component : null;
    }
    
    const isChatInterface = activeFeature === 'guide';

    return (
        <div className="min-h-screen bg-base-100 dark:bg-base-900 text-base-800 dark:text-base-200 flex flex-col">
            <GlobalLoader />
            <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-base-900/80 backdrop-blur-sm border-b border-base-200 dark:border-base-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button onClick={() => setActiveFeature('home')} className="flex items-center" aria-label="Go to homepage">
                            <AppLogo className="h-8 w-8 text-primary-500" />
                            <h1 className="text-xl font-bold ml-2 font-display text-base-900 dark:text-white">Demystify</h1>
                        </button>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <nav className="hidden md:flex md:space-x-2">
                                {features.map(({ key, name, icon }) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveFeature(key)}
                                        className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                                            activeFeature === key
                                                ? 'bg-primary-500 text-white shadow'
                                                : 'text-base-600 dark:text-base-300 hover:bg-primary-950/50 dark:hover:bg-base-800'
                                        }`}
                                    >
                                        {React.cloneElement(icon, { className: "h-5 w-5" })}
                                        <span className="ml-2">{name}</span>
                                    </button>
                                ))}
                            </nav>

                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-md text-base-500 hover:text-base-800 dark:hover:text-white hover:bg-base-100 dark:hover:bg-base-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                            </button>

                            <div className="md:hidden">
                                <button 
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-base-500 hover:text-base-800 dark:hover:text-white hover:bg-base-100 dark:hover:bg-base-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                                    aria-expanded={isMenuOpen}
                                >
                                    <span className="sr-only">Open main menu</span>
                                    {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {isMenuOpen && (
                    <nav className="md:hidden border-t border-base-200 dark:border-base-800">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {features.map(({ key, name, icon }) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setActiveFeature(key);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center px-3 py-3 text-base font-semibold rounded-lg transition-colors duration-200 ${
                                        activeFeature === key
                                            ? 'bg-primary-500 text-white shadow'
                                            : 'text-base-600 dark:text-base-300 hover:bg-primary-950/50 dark:hover:bg-base-800'
                                    }`}
                                >
                                    {React.cloneElement(icon, { className: "h-5 w-5" })}
                                    <span className="ml-3">{name}</span>
                                </button>
                            ))}
                        </div>
                    </nav>
                )}
            </header>
            
            <main className={`flex-grow ${isChatInterface ? 'flex flex-col' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
               {renderContent()}
            </main>
            
            {!isChatInterface && (
                <footer className="border-t border-base-200 dark:border-base-700 mt-auto">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-base-500 dark:text-base-400">
                        <p>&copy; {new Date().getFullYear()} Legal Document Demystifier. All Rights Reserved.</p>
                        <p className="text-xs mt-2">Disclaimer: This tool provides AI-generated information and is not a substitute for professional legal advice.</p>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default App;
