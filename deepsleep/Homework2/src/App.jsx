import { useState } from "react";

import RoleSelect from "./components/RoleSelect";
import Login from "./components/Login";

import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import ResearchManagerDashboard from "./components/ResearchManagerDashboard";
import { useEffect } from "react";
import { ensureResearcherSeed } from "./services/researcherSeed";




function App() {
  const [role, setRole] = useState(null); // student | teacher | researchManager
  const [user, setUser] = useState(null); // { email, role }
  useEffect(() => {
  ensureResearcherSeed().catch(console.error);
}, []);
  // 1) מסך ראשון: בחירת תפקיד
  if (!role) {
    return <RoleSelect onSelect={setRole} />;
  }

  // 2) מסך שני: Login (לכולם)
  if (!user) {
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
  };

  if (user.role === "student") return <StudentDashboard onLogout={onLogout} />;
  if (user.role === "teacher") return <TeacherDashboard onLogout={onLogout} />;
  return <ResearchManagerDashboard onLogout={onLogout} />;
}

export default App;
