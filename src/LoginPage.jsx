import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { initSession } from "./api.js";

export default function LoginPage({ onLogin }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSuccess(credentialResponse) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      if (!res.ok) throw new Error("Login failed");
      const user = await res.json();
      localStorage.setItem("fastagenda_user", JSON.stringify(user));
      localStorage.setItem("fastagenda_session", user.id);
      await initSession();
      onLogin(user);
    } catch {
      setError("Error al iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-700 to-blue-600 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-4xl shadow-lg">
            🏥
          </div>
          <h1 className="text-2xl font-bold text-gray-800">MedTask</h1>
          <p className="text-sm text-gray-500 text-center">
            Gestión de actividades médicas
          </p>
        </div>

        <div className="w-full border-t border-gray-100" />

        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-sm text-gray-600 font-medium">
            Inicia sesión para continuar
          </p>

          {loading ? (
            <div className="flex items-center gap-2 text-indigo-600 text-sm">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              Iniciando sesión...
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError("Error al iniciar sesión con Google.")}
              locale="es"
              text="signin_with"
              shape="rectangular"
              theme="outline"
              size="large"
            />
          )}

          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 px-3 py-2 rounded-lg w-full">
              {error}
            </p>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">
          Tus datos están protegidos y son privados
        </p>
      </div>
    </div>
  );
}
