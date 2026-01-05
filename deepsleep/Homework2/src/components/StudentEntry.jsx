import React, { useState, useEffect } from "react";
import SpaceLayout from "./ui/SpaceLayout";
import GlassCard from "./ui/GlassCard";
import { getOrCreateAnonymousStudent } from "../services/studentService";

export default function StudentEntry({ onLogin }) {
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [params, setParams] = useState({ expId: null, classId: null });

    useEffect(() => {
        // Parse URL parameters
        const searchParams = new URLSearchParams(window.location.search);
        const expId = searchParams.get("experimentId") || searchParams.get("exp");
        const classId = searchParams.get("classId") || searchParams.get("class");

        if (expId && classId) {
            setParams({ expId, classId });
        } else {
            setError("קישור לא תקין: חסרים פרטי ניסוי או כיתה.");
        }
    }, []);

    const handleStart = async (e) => {
        e.preventDefault();
        if (!code || code.length < 3) {
            setError("אנא הכנס לפחות 3 ספרות.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const user = await getOrCreateAnonymousStudent(params.expId, params.classId, code);
            // Save to session so SleepForm can read it
            sessionStorage.setItem("currentUser", JSON.stringify(user));
            // Success! Login the user
            onLogin(user);
        } catch (err) {
            console.error(err);
            setError("אירעה שגיאה בכניסה. נסה שנית.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SpaceLayout>
            <div className="w-full max-w-md mt-12 text-center px-4">
                <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    ברוכים הבאים!
                </h1>
                <p className="text-indigo-200 mb-8 tracking-wider font-mono text-xs uppercase opacity-80">
                    CLASS ENTRY PROTOCOL
                </p>

                <GlassCard className="p-8" glowColor="cyan">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {!params.expId ? (
                        <p className="text-indigo-300">אנא המתן לטעינת נתונים...</p>
                    ) : (
                        <form onSubmit={handleStart} className="space-y-6">
                            <div className="space-y-2 text-right">
                                <label className="text-sm text-indigo-300 font-bold block">
                                    הכנס את 4 הספרות האחרונות של הנייד:
                                </label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={code}
                                    onChange={(e) => {
                                        // Allow only numbers
                                        const val = e.target.value.replace(/\D/g, "");
                                        setCode(val);
                                    }}
                                    className="w-full bg-indigo-950/50 border border-indigo-500/30 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-indigo-500/50"
                                    placeholder="0000"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || code.length < 3}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(0,243,255,0.3)] disabled:opacity-50 disabled:shadow-none hover:scale-[1.02] transition-all relative overflow-hidden"
                            >
                                {loading ? (
                                    <span className="animate-pulse">מתחבר...</span>
                                ) : (
                                    "כניסה למערכת 🚀"
                                )}
                            </button>
                        </form>
                    )}
                </GlassCard>

                <div className="mt-8 text-xs text-indigo-400/50 font-mono">
                    SECURE CONNECTION ESTABLISHED
                </div>
            </div>
        </SpaceLayout>
    );
}
