import React, { createContext, useState, useEffect } from "react";
import { getToken, saveToken, removeToken } from "../util/storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    async function loadToken() {
      const token = await getToken();
      setUserToken(token);
      setLoading(false);
    }
    loadToken();
  }, []);

  const login = async (token, setupComplete) => {
    await saveToken(token);
    setUserToken(token);
    setSetupComplete(setupComplete);
  };

  const logout = async () => {
    await removeToken();
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, login, logout, loading, setupComplete, setSetupComplete}}>
      {children}
    </AuthContext.Provider>
  );
};
