import { useState } from "react";
import { loginWithDb } from "../../server/services/authDb";
import { registerStudent } from "../../server/services/studentRegistrationService";
import { registerTeacher } from "../../server/services/teacherService"; // Import registerTeacher

const ROLE_LABEL = {
  student: "תלמיד",
  teacher: "מורה",
  researchManager: "מנהל מחקר",
};

import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

export default function Login({ role, onLogin, onBack }) {
  const [isRegister, setIsRegister] = useState(false); // Toggle Login/Register

  // Login Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register Only Fields
  const [expId, setExpId] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("z"); // Default grade
  const [classNum, setClassNum] = useState("");
  const [fullName, setFullName] = useState(""); // For Teacher Name

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleLabel = ROLE_LABEL[role] ?? "משתמש";

  // Validate Submit
  let canSubmit = false;
  if (isRegister) {
    // Basic validation
    // If teacher, expId is not required (we use default). 
    const expValid = role === 'teacher' ? true : expId.trim();
    // If teacher, require fullName
    const nameValid = role === 'teacher' ? fullName.trim() : true;

    canSubmit = username.trim() && password.trim() && expValid && school.trim() && classNum.trim() && nameValid && !loading;
  } else {
    canSubmit = username.trim() !== "" && password.trim() !== "" && !loading;
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        // --- REGISTER FLOW ---
        const GRADE_MAPPING = {
          'z': 'ז',
          'h': 'ח',
          't': 'ט',
          'y': 'י',
          'ya': 'יא',
          'yb': 'יב'
        };
        const hebrewGrade = GRADE_MAPPING[grade] || grade; // Fallback to original if not found

        let newUser;
        if (role === 'teacher') {
          // Default to "Exp1" to match Manager Dashboard default
          const effectiveExpId = expId.trim() || "Exp1";
          newUser = await registerTeacher({
            experimentId: effectiveExpId,
            teacherName: fullName, // Use fullName for teacher's name
            email: username, // Use username input as email for teacher
            password: password,
            schoolName: school,
            grade: hebrewGrade, // Send Hebrew Letter
            classNum: classNum
          });
        } else {
          // Student
          newUser = await registerStudent({
            experimentId: expId,
            username: username,
            password: password,
            schoolName: school,
            grade: hebrewGrade, // Send Hebrew Letter
            classNum: classNum
          });
        }

        // Auto-login after register
        sessionStorage.setItem("currentUser", JSON.stringify(newUser));
        onLogin(newUser);

      } else {
        // --- LOGIN FLOW ---
        const user = await loginWithDb({
          role,
          username: username.trim(),
          password: password.trim(),
        });

        if (!user) {
          setError("שם משתמש או סיסמה לא נכונים");
          return;
        }

        sessionStorage.setItem("currentUser", JSON.stringify(user));
        onLogin(user);
      }
    } catch (e) {
      console.error("Auth Error:", e);
      setError(e.message || "שגיאה בחיבור למערכת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SpaceLayout>
      <GlassCard className="w-full max-w-md my-8" glowColor={isRegister ? "cyan" : "indigo"}>
        <h1 className="mb-2 text-center text-3xl font-bold text-white drop-shadow-md">
          {isRegister ? "הרשמה למערכת" : `התחברות ${roleLabel}`}
        </h1>

        <p className="mb-6 text-center text-sm text-indigo-300">
          {isRegister ? "מלא את הפרטים כדי להצטרף לניסוי" : "הזן פרטים כדי להמשיך"}
        </p>

        <div className="space-y-4">

          {/* REGISTER EXTRA FIELDS */}
          {isRegister && (
            <div className="space-y-4 animate-fadeIn">
              {/* Experiment ID - Visible for everyone now, defaulting to Exp1 */}
              <input
                type="text"
                placeholder="קוד ניסוי (ברירת מחדל: Exp1)"
                value={expId}
                onChange={(e) => setExpId(e.target.value)}
                className="w-full rounded-xl bg-indigo-950/40 border border-indigo-500/30 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none"
              />

              {role === 'teacher' && (
                <input
                  type="text"
                  placeholder="שם מלא (להצגה לתלמידים)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl bg-indigo-950/40 border border-indigo-500/30 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none"
                />
              )}

              <input
                type="text"
                placeholder="שם בית ספר (חייב להיות זהה להגדרת המנהל)"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full rounded-xl bg-indigo-950/40 border border-indigo-500/30 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none mb-3"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="מס' כיתה (למשל: 5)"
                  value={classNum}
                  onChange={(e) => setClassNum(e.target.value)}
                  className="w-full rounded-xl bg-indigo-950/40 border border-indigo-500/30 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none"
                />

                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-xl bg-indigo-950/40 border border-indigo-500/30 px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
                >
                  <option value="z">שכבה ז'</option>
                  <option value="h">שכבה ח'</option>
                  <option value="t">שכבה ט'</option>
                  <option value="y">שכבה י'</option>
                  <option value="ya">שכבה י"א</option>
                  <option value="yb">שכבה י"ב</option>
                </select>
              </div>
            </div>
          )}

          {/* COMMON FIELDS */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder={isRegister ? "בחר שם משתמש" : "שם משתמש"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-indigo-950/40 border border-indigo-500/30 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
          </div>

          <div className="space-y-2">
            <input
              type="password"
              placeholder={isRegister ? "בחר סיסמה" : "סיסמה"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-indigo-950/40 border border-indigo-500/30 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
          </div>

          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`w-full rounded-2xl py-4 font-bold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${isRegister
                ? "bg-gradient-to-r from-cyan-600 to-blue-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                : "bg-gradient-to-r from-indigo-600 to-cyan-500 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]"
              } hover:-translate-y-1`}
          >
            {loading ? "מעבד נתונים..." : (isRegister ? "✨ הרשמה והתחלה" : "כניסה למערכת")}
          </button>

          {error && (
            <div className="rounded-lg bg-red-900/50 border border-red-500/50 p-3 text-center animate-shake">
              <p className="text-sm font-medium text-red-200">{error}</p>
            </div>
          )}

          {/* TOGGLE REGISTER MODE (Students & Teachers) */}
          {(role === 'student' || role === 'teacher') && (
            <div className="text-center pt-2 border-t border-white/10 mt-4">
              <span className="text-indigo-300 text-sm ml-2">
                {isRegister ? "כבר יש לך משתמש?" : "אין לך עדיין משתמש?"}
              </span>
              <button
                onClick={() => {
                  setError("");
                  setIsRegister(!isRegister);
                }}
                className="text-cyan-400 font-bold hover:text-cyan-300 underline decoration-cyan-500/30 underline-offset-4 transition-colors"
              >
                {isRegister ? "התחבר כאן" : "הירשם עכשיו"}
              </button>
            </div>
          )}

          <button
            onClick={onBack}
            className="w-full text-indigo-400 hover:text-white transition-colors text-sm mt-2"
          >
            חזרה לתפריט הראשי
          </button>
        </div>
      </GlassCard>

      <div className="absolute bottom-4 text-indigo-500/30 text-xs font-mono tracking-widest pointer-events-none z-20">
        DEEP-SLEEP LABS // AUTH // {isRegister ? "REGISTRATION" : "LOGIN"}
      </div>
    </SpaceLayout >
  );
}