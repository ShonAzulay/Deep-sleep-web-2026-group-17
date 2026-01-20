import React from 'react';
import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

export default function StudentWelcomeScreen({ onStart, onLogout, submissionCount }) {
    return (
        <SpaceLayout>
            <div className="w-full max-w-lg mt-8 text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2 drop-shadow-[0_0_15px_rgba(0,243,255,0.5)] animate-pulse">
                    DAILY MISSION
                </h1>
                {/* Visual Streak Tracker */}
                <div className="flex justify-center gap-1 mb-4">
                    {Array.from({ length: 14 }).map((_, i) => (
                        <div
                            key={i}
                            className={`
                                w-3 h-5 sm:w-4 sm:h-6 rounded-sm border transition-all duration-300
                                ${i < submissionCount
                                    ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_10px_#22d3ee] scale-105'
                                    : 'bg-indigo-950/30 border-indigo-500/30'
                                }
                            `}
                            title={`Day ${i + 1}`}
                        />
                    ))}
                </div>

                <p className="text-indigo-200 mb-8 tracking-wider font-mono text-xs uppercase opacity-80">
                    DAY {submissionCount + 1} // REPORT REQUIRED
                </p>

                <GlassCard className="mb-6 relative group overflow-hidden" glowColor="cyan">
                    <h2 className="text-2xl font-bold text-white mb-4">יומן שינה יומי</h2>
                    <p className="text-indigo-200 mb-6 text-sm">
                        כדי להתקדם במסע ולצבור נקודות, עליך למלא את הדיווח היומי שלך. זה לוקח דקה אחת.
                    </p>
                    <button
                        onClick={onStart}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:scale-[1.03] transition-transform"
                    >
                        התחל שאלון 📝
                    </button>
                </GlassCard>

                {/* Locked Game Card */}
                <div className="relative rounded-3xl overflow-hidden border border-indigo-500/30 bg-black/40 backdrop-blur-sm p-1">
                    {/* Locked Overlay */}
                    <div className="absolute inset-0 bg-indigo-950/80 z-20 flex flex-col items-center justify-center text-center p-4 backdrop-blur-[2px]">
                        <div className="w-16 h-16 rounded-full bg-indigo-900/50 border border-indigo-500/50 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                            <span className="text-3xl">🔒</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">המשחק נעול</h3>
                        <p className="text-xs text-indigo-300 uppercase tracking-widest">
                            המשחק ייפתח לאחר מילוי השאלון
                        </p>
                    </div>

                    {/* Background visuals (fake game preview) */}
                    <div className="h-32 w-full opacity-20 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter grayscale blur-sm"></div>
                </div>

                {/* Footer Branding */}
                <div className="absolute bottom-4 left-0 right-0 text-indigo-500/30 text-xs font-mono tracking-widest pointer-events-none mb-10">
                    DEEP-SLEEP LABS // V2.0
                </div>

                <button onClick={onLogout} className="mt-8 text-sm text-indigo-400 hover:text-white transition-colors underline decoration-indigo-500/30 underline-offset-4">
                    התנתק מהמערכת
                </button>
            </div>
        </SpaceLayout>
    );
}
