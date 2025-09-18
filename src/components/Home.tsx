import React from 'react';
import { motion } from 'framer-motion';
import type { FeatureKey } from '../types';
import Card from './shared/Card';
import TextGenerateEffect from './shared/TextGenerateEffect';

interface HomeProps {
    setActiveFeature: (feature: FeatureKey) => void;
    features: {
        key: FeatureKey;
        name: string;
        description: string;
        icon: React.ReactElement<{ className?: string }>;
    }[];
}

const Home: React.FC<HomeProps> = ({ setActiveFeature, features }) => {
    const svgContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.3, delayChildren: 0.5 }
        }
    };

    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
        }
    };
    
    return (
        <div className="animate-fade-in space-y-12 md:space-y-24 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
                <div className="space-y-6 text-center lg:text-left">
                    <TextGenerateEffect words="Understand Legal Documents, Instantly." />
                    <p className="text-lg md:text-xl text-base-600 dark:text-base-400 max-w-xl mx-auto lg:mx-0">
                        Demystify simplifies complex legal documents into clear, accessible guidance, empowering users to make informed decisions.
                    </p>
                </div>
                 <motion.div 
                    className="relative w-full h-80 flex items-center justify-center"
                    variants={svgContainerVariants}
                    initial="hidden"
                    animate="visible"
                 >
                    <svg viewBox="0 0 200 200" className="absolute w-full h-full">
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--tw-color-primary-500)" />
                                <stop offset="100%" stopColor="var(--tw-color-primary-400)" />
                            </linearGradient>
                             <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--tw-color-primary-700)" />
                                <stop offset="100%" stopColor="var(--tw-color-primary-500)" />
                            </linearGradient>
                        </defs>
                        {/* Complex lines fading out */}
                        <motion.path d="M 20 100 C 50 20, 150 180, 180 100" stroke="url(#grad2)" strokeWidth="1.5" fill="none" initial={{ pathLength: 1, opacity: 0.4 }} animate={{ opacity: 0 }} transition={{ duration: 1, delay: 1 }} />
                        <motion.path d="M 20 100 Q 100 180, 180 100" stroke="url(#grad1)" strokeWidth="1.5" fill="none" initial={{ pathLength: 1, opacity: 0.4 }} animate={{ opacity: 0 }} transition={{ duration: 1, delay: 1.2 }}/>
                        <motion.path d="M 20 100 Q 100 20, 180 100" stroke="url(#grad2)" strokeWidth="1.5" fill="none" initial={{ pathLength: 1, opacity: 0.4 }} animate={{ opacity: 0 }} transition={{ duration: 1, delay: 1.4 }}/>
                        
                        {/* Simple clear line drawing in */}
                        <motion.line x1="10" y1="100" x2="190" y2="100" stroke="url(#grad1)" strokeWidth="4" strokeLinecap="round" variants={pathVariants} transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }}/>
                    </svg>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
                {features.map((feature) => (
                    <button
                        key={feature.key}
                        onClick={() => setActiveFeature(feature.key)}
                        className="text-left w-full h-full group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-base-950 rounded-xl"
                        aria-label={`Launch ${feature.name}`}
                    >
                        <Card className="group-hover:border-primary-500/80 dark:group-hover:border-primary-500/80 group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col">
                            <div className="flex-shrink-0 text-primary-500">{React.cloneElement(feature.icon, { className: "h-8 w-8" })}</div>
                            <h2 className="mt-4 text-xl font-bold font-display text-base-900 dark:text-white">{feature.name}</h2>
                            <p className="mt-2 text-base-600 dark:text-base-400 flex-grow">{feature.description}</p>
                             <div className="mt-6 text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center group-hover:underline">
                                Launch Tool
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </div>
                        </Card>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Home;