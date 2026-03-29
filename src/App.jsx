import { useState, useEffect } from "react";
import MedTaskManager from "./MedTaskManager";
import LoginPage from "./LoginPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("fastagenda_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("fastagenda_user");
        localStorage.removeItem("fastagenda_session");
      }
    }
    setLoading(false);
  }, []);

  function handleLogout() {
    localStorage.removeItem("fastagenda_user");
    localStorage.removeItem("fastagenda_session");
    setUser(null);
  }

  if (loading) return null;

  if (!user) return <LoginPage onLogin={setUser} />;

  return <MedTaskManager user={user} onLogout={handleLogout} />;
}
