import React from 'react';
import { useLoading } from '../../contexts/LoadingContext';

const GlobalLoader: React.FC = () => {
    const { isLoading } = useLoading();

    if (!isLoading) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-base-950/70 z-[100] flex flex-col items-center justify-center backdrop-blur-sm transition-opacity duration-300 animate-fade-in" aria-live="assertive" role="alert">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
            <p className="mt-6 text-xl font-semibold text-white font-display">Demystifying...</p>
        </div>
    );
};

export default GlobalLoader;
