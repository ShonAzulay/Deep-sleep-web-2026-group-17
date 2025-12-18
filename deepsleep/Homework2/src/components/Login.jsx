import { useState } from "react";
import { loginWithDb } from "../services/authDb";

const ROLE_LABEL = {
  student: "תלמיד",
  teacher: "מורה",
  researchManager: "מנהל מחקר",
};

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

      // במידה ונמצא משתמש ב-DB, עוברים לדשבורד
      onLogin(user);
    } catch (e) {
      console.error("Login Error:", e);
      setError("שגיאה בחיבור למערכת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center
                 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
                 px-4"
    >
      <div className="w-full max-w-md rounded-3xl bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
          התחברות {roleLabel}
        </h1>

        <p className="mb-6 text-center text-sm text-slate-500">
          הזן פרטים כדי להמשיך
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="שם משתמש"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          />

          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          />

          <button
            disabled={!canSubmit}
            onClick={handleLogin}
            className="w-full rounded-2xl
                       bg-gradient-to-r from-indigo-600 to-blue-600
                       py-3 font-semibold text-white
                       disabled:opacity-40"
          >
            {loading ? "בודק..." : "התחבר"}
          </button>

          {error && (
            <p className="text-center text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={onBack}
            className="w-full rounded-2xl border py-3 font-semibold text-slate-800"
          >
            חזרה
          </button>
        </div>
      </div>
    </div>
  );
}