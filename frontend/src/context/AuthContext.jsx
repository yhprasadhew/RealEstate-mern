import React, { createContext, useState, useContext } from "react";
import axios from 'axios'; // terminal eke npm i
import API_URL from "../config";

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token") || null
  );

  // You can pass user, token, setUser, and setToken down to any child component
  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook to use the Auth context
export const useAuth = () => useContext(AuthContext);