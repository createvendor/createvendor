'use client';

import Link from 'next/link';

export default function StoreNotFound() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
            {/* Dotted grid background */}
            <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />

            {/* Glow blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Error code badge */}
            <div className="relative z-10 mb-6 inline-flex items-center gap-2 border border-white/15 rounded-full px-4 py-1.5 text-[11px] font-bold text-white/50 uppercase tracking-widest bg-white/5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                Error Code 404
            </div>

            {/* Giant 404 */}
            <div className="relative z-10 select-none">
                <h1
                    className="text-[140px] md:text-[200px] font-black leading-none text-transparent bg-clip-text"
                    style={{
                        backgroundImage: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.3) 100%)',
                        letterSpacing: '-0.04em',
                    }}
                >
                    404
                </h1>
            </div>

            {/* Title & desc */}
            <div className="relative z-10 -mt-4 mb-8 space-y-3">
                <h2 className="text-[22px] md:text-[28px] font-bold text-white tracking-tight">
                    Page Not Found
                </h2>
                <p className="text-[14px] text-white/40 max-w-sm mx-auto leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved to another dimension.
                </p>
            </div>

            {/* Buttons */}
            <div className="relative z-10 flex items-center gap-3">
                <Link href="/">
                    <button className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-100 transition-all shadow-lg">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Go Home
                    </button>
                </Link>
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 border border-white/20 text-white px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-white/10 transition-all"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Go Back
                </button>
            </div>
        </div>
    );
}
