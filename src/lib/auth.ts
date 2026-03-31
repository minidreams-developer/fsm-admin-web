const AUTH_KEY = "fsm_auth";

export const isAuthenticated = () => localStorage.getItem(AUTH_KEY) === "true";
export const login = () => localStorage.setItem(AUTH_KEY, "true");
export const logout = () => localStorage.removeItem(AUTH_KEY);
