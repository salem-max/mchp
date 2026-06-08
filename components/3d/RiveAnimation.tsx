'use client';

import React, { useRef, useEffect } from 'react';
import { useRive, Fit, Alignment, Layout } from '@rive-app/react-webgl2';
import { cn } from '@/lib/utils';

interface RiveAnimationProps {
    src: string;
    stateMachines?: string;
    autoplay?: boolean;
    className?: string;
    width?: number | string;
    height?: number | string;
    onStateChange?: (state: string) => void;
    fit?: Fit;
    alignment?: Alignment;
}

/**
 * Rive Animation Component
 * Render interactive Rive animations
 * Great for interactive illustrations, loading animations, UI elements
 */
export function RiveAnimation({
    src,
    stateMachines,
    autoplay = true,
    className,
    width = '100%',
    height = '400px',
    onStateChange,
    fit = Fit.Contain,
    alignment = Alignment.Center,
}: RiveAnimationProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { rive, RiveComponent } = useRive({
        src,
        stateMachines: stateMachines ? [stateMachines] : undefined,
        autoplay,
    });

    useEffect(() => {
        if (rive && fit && alignment) {
            rive.layout = new Layout({ fit, alignment });
        }
    }, [rive, fit, alignment]);

    return (
        <div
            ref={containerRef}
            className={cn('relative overflow-hidden rounded-lg', className)}
            style={{ width, height }}
        >
            {RiveComponent && <RiveComponent />}
        </div>
    );
}

/**
 * Rive Loading Animation
 * Pre-built loading spinner using Rive
 */
export function RiveLoadingSpinner({
    className,
    size = 'md',
}: {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}) {
    const sizeMap = {
        sm: 80,
        md: 120,
        lg: 160,
    };

    return (
        <div className={cn('flex items-center justify-center', className)}>
            <div style={{ width: sizeMap[size], height: sizeMap[size] }}>
                <RiveAnimation
                    src="/animations/loading-spinner.riv"
                    autoplay
                    fit={Fit.Contain}
                />
            </div>
        </div>
    );
}

export default RiveAnimation;
