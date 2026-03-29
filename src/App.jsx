import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useState, useEffect } from "react";
import MedTaskManager from "./MedTaskManager";
import { loginWithGoogle, isAuthenticated, getUser, logout } from "./api";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// ── Pantalla de login ─────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function handleSuccess(credentialResponse) {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      onLogin(user);
    } catch {
      setError("Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
          🏥
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">MedTask</h1>
        <p className="text-sm text-gray-500 mb-8">Gestión de actividades médicas</p>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}

        {loading ? (
          <div className="text-indigo-600 text-sm font-medium animate-pulse py-3">
            Iniciando sesión…
          </div>
        ) : (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError("No se pudo conectar con Google.")}
              text="signin_with"
              shape="rectangular"
              theme="outline"
              size="large"
              locale="es"
            />
          </div>
        )}

        <p className="text-xs text-gray-400 mt-6">
          Tus datos son privados y solo tú puedes verlos.
        </p>
      </div>
    </div>
  );
}

// ── App principal ─────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser]         = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) setUser(getUser());
    setChecking(false);
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-700 to-blue-600 flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Cargando…</div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      {user
        ? <MedTaskManager user={user} onLogout={handleLogout} />
        : <LoginScreen onLogin={setUser} />
      }
    </GoogleOAuthProvider>
  );
}
