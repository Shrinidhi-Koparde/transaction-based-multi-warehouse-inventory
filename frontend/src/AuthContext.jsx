import React, {
  createContext,
  useContext,
  useMemo,
  useState
} from "react";

import { authApi } from "./api";

const AuthContext = createContext(null);

const VALID_ROLES = [
  "Admin",
  "Operations Manager",
  "Warehouse Manager",
  "Logistics Staff"
];

function normalizeUser(data) {
  const user =
    data?.user ||
    data?.data?.user ||
    data;

  if (!user || typeof user !== "object") {
    throw new Error("Invalid user information received.");
  }

  return {
    id: user.id,
    username: user.username || "User",
    email: user.email || "",
    role: user.role || "Unknown",
    is_active: user.is_active ?? true
  };
}

function getStoredUser() {
  try {
    const stored = sessionStorage.getItem("e4_user");

    if (!stored) return null;

    const user = JSON.parse(stored);

    if (
      !user ||
      !user.id ||
      !VALID_ROLES.includes(user.role)
    ) {
      sessionStorage.removeItem("e4_user");
      sessionStorage.removeItem("e4_token");
      return null;
    }

    return user;
  } catch {
    sessionStorage.removeItem("e4_user");
    sessionStorage.removeItem("e4_token");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(
    () => sessionStorage.getItem("e4_token")
  );

  async function login(identifier, password) {
    const response = await authApi.login({
      identifier,
      password
    });

    const data = response.data || {};

    const accessToken =
      data.access_token ||
      data.accessToken ||
      data.token;

    const normalizedUser = normalizeUser(data);

    if (!accessToken) {
      throw new Error("Access token was not received.");
    }

    if (!VALID_ROLES.includes(normalizedUser.role)) {
      throw new Error("Invalid user role received from server.");
    }

    if (normalizedUser.is_active === false) {
      throw new Error("Your account is inactive.");
    }

    sessionStorage.setItem("e4_token", accessToken);

    sessionStorage.setItem(
      "e4_user",
      JSON.stringify(normalizedUser)
    );

    setToken(accessToken);
    setUser(normalizedUser);

    return normalizedUser;
  }

  function logout() {
    sessionStorage.removeItem("e4_token");
    sessionStorage.removeItem("e4_user");

    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout
    }),
    [user, token]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}