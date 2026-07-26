import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Login successful");
      } else {
        await register(fullName, email, password);
        toast.success("Registration successful");
        await login(email, password);
      }

      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-xl space-y-5"
      >
        <h1 className="text-3xl font-bold text-center">
          {isLogin ? "Login" : "Create Account"}
        </h1>

        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold hover:bg-blue-700"
        >
          {loading
            ? "Please wait..."
            : isLogin
            ? "Login"
            : "Register"}
        </button>

        <p className="text-center text-sm text-slate-400">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <span
                className="cursor-pointer text-blue-400"
                onClick={() => navigate("/register")}
              >
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                className="cursor-pointer text-blue-400"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
}