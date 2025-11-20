import { ReactNode } from "react";
import { AuthContext, AuthUser } from "@/contexts/AuthContext";

type AuthValue = {
  user: AuthUser;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (u: AuthUser) => void;
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
