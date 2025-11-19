import { ReactNode } from "react";
import { AuthContext } from "@/contexts/AuthContext";

type User = {
  _id?: string;
  username?: string;
  favorites?: any[];
  readLater?: any[];
  alreadyRead?: any[];
} | null;

type AuthValue = {
  user: User;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (u: User) => void;
};

export function createAuthWrapper(
  overrides: Partial<AuthValue> = {}
): React.ComponentType<{ children: ReactNode }> {
  const defaultValue: AuthValue = {
    user: null,
    loading: false,
    refreshUser: jest.fn().mockResolvedValue(undefined),
    setUser: jest.fn(),
  };

  const value = { ...defaultValue, ...overrides };

  return function AuthProviderMock({ children }: { children: ReactNode }) {
    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
  };
}
