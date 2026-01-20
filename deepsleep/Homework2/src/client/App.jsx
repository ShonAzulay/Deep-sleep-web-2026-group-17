import { useEffect, useState } from "react";
import { useAppContext } from "./context/AppContext";

import RoleSelect from "./components/RoleSelect";
import Login from "./components/Login";
import StudentEntry from "./components/StudentEntry";

import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import ResearchManagerDashboard from "./components/ResearchManagerDashboard";
// Service import updated to server path
import { ensureResearcherSeed } from "../server/services/researcherSeed";

function App() {
  const { user, setUser, role, setRole, logout } = useAppContext();
  const [isClassLink, setIsClassLink] = useState(false);

  useEffect(() => {
    ensureResearcherSeed().catch(console.error);

    // Check for Class Link params
    const params = new URLSearchParams(window.location.search);
    const expId = params.get("experimentId") || params.get("exp");
    const classId = params.get("classId") || params.get("class");

    if (expId && classId) {
      setIsClassLink(true);
      setRole("student"); // Auto-set role in context
    }
  }, [setRole]);

  // 1) מסך ראשון: בחירת תפקיד (רק אם לא בקישור כיתה ואין תפקיד)
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
  // Note: logout function from context replaces local onLogout definition, 
  // but we might need to handle specific cleanups if needed. Both work.
  // The original onLogout also cleared role, context logout does too.

  if (user.role === "student") return <StudentDashboard onLogout={logout} />;
  if (user.role === "teacher") return <TeacherDashboard onLogout={logout} />;
  return <ResearchManagerDashboard onLogout={logout} />;
}

export default App;
