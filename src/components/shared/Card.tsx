import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-base-800/50 rounded-xl shadow-lg shadow-base-200/50 dark:shadow-base-950/50 border border-base-200/80 dark:border-base-700/50 p-6 md:p-8 transition-colors duration-300 ${className}`}>
            {children}
        </div>
    );
};

export default Card;