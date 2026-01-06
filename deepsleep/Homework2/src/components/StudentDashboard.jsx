import SleepForm from "./SleepForm";

export default function StudentDashboard({ onLogout }) {
  // SleepForm now handles the entire page layout and design (Space Theme)
  return <SleepForm onLogout={onLogout} />;
}