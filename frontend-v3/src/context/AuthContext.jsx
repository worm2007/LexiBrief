import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://lexibrief-backend.onrender.com";
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("lexibrief_token")
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  const logout = () => {
    localStorage.removeItem("lexibrief_token");
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const fetchCurrentUser = async (accessToken) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Session expired");
      }

      const data = await response.json();
      setUser(data);
      return data;
    } catch (error) {
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token).catch(() => {
        // logout is already handled inside fetchCurrentUser
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }
localStorage.setItem("lexibrief_token", data.access_token);
setToken(data.access_token);
setUser(data.user);

return data;
    
  };

const register = async (fullName, email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || "Registration failed");
  }

  localStorage.setItem("lexibrief_token", data.access_token);
  setToken(data.access_token);
  setUser(data.user);

  return data;
};

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshUser: () => {
        if (!token) return Promise.resolve(null);
        return fetchCurrentUser(token);
      },
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
