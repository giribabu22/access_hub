import React from 'react';

const ModernLoader = ({
    type = 'spinner',
    size = 'md',
    color = 'teal',
    text = '',
    className = ''
}) => {
    const sizeMap = {
        xs: 'w-4 h-4',
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const colorMap = {
        teal: 'border-teal-600',
        blue: 'border-blue-600',
        indigo: 'border-indigo-600',
        purple: 'border-purple-600',
        white: 'border-white'
    };

    const textColorMap = {
        teal: 'text-teal-700',
        blue: 'text-blue-700',
        indigo: 'text-indigo-700',
        purple: 'text-purple-700',
        white: 'text-white'
    };

    if (type === 'pulse') {
        return (
            <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
                <div className="relative">
                    <div className={`${sizeMap[size]} rounded-full bg-teal-600/20 animate-ping absolute inset-0`}></div>
                    <div className={`${sizeMap[size]} rounded-full bg-teal-600 shadow-lg relative z-10`}></div>
                </div>
                {text && <p className={`text-sm font-semibold animate-pulse ${textColorMap[color]}`}>{text}</p>}
            </div>
        );
    }

    if (type === 'skeleton') {
        return (
            <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`}></div>
        );
    }

    // Premium Morphing Spinner
    return (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            <div className="relative">
                {/* Background Ring */}
                <div className={`${sizeMap[size]} border-4 border-gray-100 rounded-full`}></div>
                {/* Animated Active Ring */}
                <div className={`absolute top-0 left-0 ${sizeMap[size]} border-4 ${colorMap[color]} border-t-transparent rounded-full animate-spin shadow-sm`}></div>
                {/* Inner Glow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-teal-500 rounded-full blur-[2px] animate-pulse`}></div>
            </div>
            {text && (
                <div className="flex flex-col items-center">
                    <p className={`text-sm font-bold tracking-wide ${textColorMap[color]} animate-pulse`}>
                        {text}
                    </p>
                    <div className="flex gap-1 mt-1">
                        <div className="w-1 h-1 bg-current rounded-full animate-[bounce_1.4s_infinite_0ms]"></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-[bounce_1.4s_infinite_200ms]"></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-[bounce_1.4s_infinite_400ms]"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModernLoader;
