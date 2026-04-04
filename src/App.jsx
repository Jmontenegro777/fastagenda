import { useState, useEffect } from "react";
import MedTaskManager from "./MedTaskManager";
import LoginPage from "./LoginPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fastagenda_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // localStorage inaccesible (modo privado, cookies bloqueadas) o JSON inválido
    } finally {
      setLoading(false);
    }
  }, []);

  function handleLogout() {
    try {
      localStorage.removeItem("fastagenda_user");
      localStorage.removeItem("fastagenda_session");
    } catch { /* ignore */ }
    setUser(null);
  }

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl shadow-lg">🏥</div>
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );

  if (!user) return <LoginPage onLogin={setUser} />;

  return <MedTaskManager user={user} onLogout={handleLogout} />;
}
