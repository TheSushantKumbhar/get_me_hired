import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  async function fetchUser() {
    setAuthError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/user", {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        setUser(null);
        return;
      }

      if (!response.ok) throw new Error("failed to fetch user");

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function register(username, email, password) {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError("failed to register");
      } else {
        await login(username, password);
      }

      return data;
    } catch (err) {
      setAuthError("something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function login(username, password) {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchUser();
      } else {
        setAuthError("incorrect username/ password");
      }
    } catch (err) {
      setAuthError("something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setAuthError("");
    setLoading(true);
    try {
      await fetch("http://localhost:3000/logout", {
        method: "GET",
        credentials: "include",
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, register, login, logout, loading, authError }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
