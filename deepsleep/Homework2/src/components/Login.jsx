import { useState } from "react";
import { loginWithDb } from "../services/authDb";

const ROLE_LABEL = {
  student: "תלמיד",
  teacher: "מורה",
  researchManager: "מנהל מחקר",
};

import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

export default function Login({ role, onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleLabel = ROLE_LABEL[role] ?? "משתמש";
  const canSubmit = username.trim() !== "" && password.trim() !== "" && !loading;

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      // בדיקה אחידה מול ה-DB לכל התפקידים
      const user = await loginWithDb({
        role,
        username: username.trim(),
        password: password.trim(),
      });

      if (!user) {
        setError("שם משתמש או סיסמה לא נכונים");
        return;
      }

      // שמירת פרטי המשתמש (כולל experimentId ו-classId) ב-Session
      sessionStorage.setItem("currentUser", JSON.stringify(user));

      // מעבר לדשבורד
      onLogin(user);
    } catch (e) {
      console.error("Login Error:", e);
      setError("שגיאה בחיבור למערכת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SpaceLayout>
      <GlassCard className="w-full max-w-md" glowColor="indigo">
        <h1 className="mb-2 text-center text-3xl font-bold text-white drop-shadow-md">
          התחברות {roleLabel}
        </h1>

        <p className="mb-8 text-center text-sm text-indigo-300">
          הזן פרטים כדי להמשיך
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="שם משתמש"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-indigo-950/40 border border-indigo-500/30 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-indigo-950/40 border border-indigo-500/30 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            disabled={!canSubmit}
            onClick={handleLogin}
            className="w-full rounded-2xl
                       bg-gradient-to-r from-indigo-600 to-cyan-500
                       py-4 font-bold text-white
                       shadow-lg hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:-translate-y-1 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "מתחבר..." : "כניסה למערכת"}
          </button>

          {error && (
            <div className="rounded-lg bg-red-900/50 border border-red-500/50 p-3 text-center">
              <p className="text-sm font-medium text-red-200">
                {error}
              </p>
            </div>
          )}

          <button
            onClick={onBack}
            className="w-full text-indigo-400 hover:text-white transition-colors text-sm"
          >
            חזרה לתפריט הראשי
          </button>
        </div>
      </GlassCard>
      
      {/* Footer Branding */}
      <div className="absolute bottom-4 text-indigo-500/30 text-xs font-mono tracking-widest pointer-events-none z-20">
        DEEP-SLEEP LABS // AUTH
      </div>
    </SpaceLayout>
  );
}