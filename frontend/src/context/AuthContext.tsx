"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useGetCurrentUserQuery } from "@/state/api";
import { User, AuthResponse } from "@/state/api";

interface AuthContextType {
  user: User | null;
  login: (token: AuthResponse) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [localLoading, setLocalLoading] = useState<boolean>(true);

  const { data: currentUser, refetch, isLoading: queryLoading } = useGetCurrentUserQuery(undefined);

  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLocalLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refetch().then((result) => {
        if (result.data) {
          setUser(result.data);
        } else {
          setUser(null);
        }
      });
    }
  }, [isAuthenticated, refetch]);

  const login = async (token: AuthResponse) => {
    Cookies.set("accessToken", token.access);
    Cookies.set("refreshToken", token.refresh);

    setIsAuthenticated(true);
    const result = await refetch();
    if (result.data) {
      setUser(result.data);
    } else {
      setUser(token.user);
    }
  };

  const logout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isLoading: localLoading || queryLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
