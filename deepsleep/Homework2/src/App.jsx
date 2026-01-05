import { useState, useEffect } from "react";

import RoleSelect from "./components/RoleSelect";
import Login from "./components/Login";
import StudentEntry from "./components/StudentEntry";

import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import ResearchManagerDashboard from "./components/ResearchManagerDashboard";
import { ensureResearcherSeed } from "./services/researcherSeed";

function App() {
  const [role, setRole] = useState(null); // student | teacher | researchManager
  const [user, setUser] = useState(null); // { email, role }
  const [isClassLink, setIsClassLink] = useState(false);

  useEffect(() => {
    ensureResearcherSeed().catch(console.error);

    // Check for Class Link params
    const params = new URLSearchParams(window.location.search);
    const expId = params.get("experimentId") || params.get("exp");
    const classId = params.get("classId") || params.get("class");

    if (expId && classId) {
      setIsClassLink(true);
      setRole("student"); // Auto-set role
    }
  }, []);

  // 1) מסך ראשון: בחירת תפקיד (רק אם לא בקישור כיתה)
  if (!role && !isClassLink) {
    return <RoleSelect onSelect={setRole} />;
  }

  // 2) מסך שני: Login (לכולם) או StudentEntry (לקישור כיתה)
  if (!user) {
    if (isClassLink) {
      return <StudentEntry onLogin={(u) => setUser(u)} />;
    }
    return (
      <Login
        role={role}
        onBack={() => setRole(null)}
        onLogin={(u) => setUser(u)}
      />
    );
  }

  // 3) מסך שלישי: Dashboard לפי תפקיד
  const onLogout = () => {
    setUser(null);
    setRole(null);
    // If it was a class link, reload to clear state or just keep them in entry screen?
    // For now, simple state clear. If they refresh, they go back to entry.
    if (isClassLink) {
      // Optional: maybe reload page to cleanly reset?
      // window.location.reload(); 
    }
  };

  if (user.role === "student") return <StudentDashboard onLogout={onLogout} />;
  if (user.role === "teacher") return <TeacherDashboard onLogout={onLogout} />;
  return <ResearchManagerDashboard onLogout={onLogout} />;
}

export default App;
