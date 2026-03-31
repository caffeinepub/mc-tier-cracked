import type { Identity } from "@icp-sdk/core/agent";
import { useQuery } from "@tanstack/react-query";
import {
  type ReactNode,
  createContext,
  createElement,
  useContext,
} from "react";
import { UserRole } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export type UserAppRole = "admin" | "tester" | "user";

export interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  role: UserAppRole | null;
  login: () => void;
  logout: () => void;
  identity: Identity | undefined;
  principal: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapRole(role: UserRole): UserAppRole {
  if (role === UserRole.admin) return "admin";
  if (role === UserRole.guest) return "tester";
  return "user";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { login, clear, identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const principalStr = identity?.getPrincipal().toString() ?? null;
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const roleQuery = useQuery<UserAppRole | null>({
    queryKey: ["userRole", principalStr],
    queryFn: async () => {
      if (!actor || !isLoggedIn) return null;
      try {
        const role = await actor.getCallerUserRole();
        return mapRole(role);
      } catch {
        return "user";
      }
    },
    enabled: !!actor && !actorFetching && isLoggedIn,
    staleTime: 30_000,
  });

  const value: AuthContextType = {
    isLoggedIn,
    isLoading:
      isInitializing || actorFetching || (isLoggedIn && roleQuery.isLoading),
    role: isLoggedIn ? (roleQuery.data ?? null) : null,
    login,
    logout: clear,
    identity,
    principal: principalStr,
  };

  return createElement(AuthContext.Provider, { value, children });
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
