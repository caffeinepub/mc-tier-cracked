import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Application,
  Tier as BackendTier,
  Player,
  ProfileEntry,
  UserProfile,
} from "../backend.d";
import { PlayerTag } from "../backend.d";
import type { Player as LocalPlayer } from "../data/dummyData";
import { backendPlayerToLocal } from "../utils/playerUtils";
import { useActor } from "./useActor";
import { useAuth } from "./useAuth";

export { PlayerTag };
export type { Player };

export function useApprovedPlayers() {
  const { actor, isFetching } = useActor();
  return useQuery<LocalPlayer[]>({
    queryKey: ["approvedPlayers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const players = await actor.listAllApprovedPlayers();
        return players.map(backendPlayerToLocal);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlayerByUsername(username: string) {
  const { actor, isFetching } = useActor();
  return useQuery<LocalPlayer | null>({
    queryKey: ["player", username],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const player = await actor.getPlayerByUsername(username);
        return backendPlayerToLocal(player);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!username,
  });
}

export function useOwnedApplications() {
  const { actor, isFetching } = useActor();
  return useQuery<Application[]>({
    queryKey: ["ownedApplications"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getOwnedApplications();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePendingApplications() {
  const { actor, isFetching } = useActor();
  return useQuery<Application[]>({
    queryKey: ["pendingApplications"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listAllPendingApplications();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllApplicationsWithPrincipals() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ["allApplicationsWithPrincipals"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listAllApplicationsWithPrincipals();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

type SubmitApplicationParams = [
  username: string,
  discord: string | null,
  axePvp: BackendTier,
  swordPvp: BackendTier,
  crystalPvp: BackendTier,
  uhc: BackendTier,
  nethpot: BackendTier,
  smpPvp: BackendTier,
  macePvp: BackendTier,
  cartPvp: BackendTier,
  overall: BackendTier,
];

export function useSubmitApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: SubmitApplicationParams) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitApplication(...params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownedApplications"] });
    },
  });
}

export function useReviewApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      approve,
    }: { principal: any; approve: boolean }) => {
      if (!actor) throw new Error("Not connected");
      return actor.reviewApplication(principal, approve);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingApplications"] });
      queryClient.invalidateQueries({ queryKey: ["approvedPlayers"] });
      queryClient.invalidateQueries({
        queryKey: ["allApplicationsWithPrincipals"],
      });
    },
  });
}

export function useDeletePlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (principal: any) => {
      if (!actor) throw new Error("Not connected");
      return actor.deletePlayer(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvedPlayers"] });
      queryClient.invalidateQueries({
        queryKey: ["allApplicationsWithPrincipals"],
      });
    },
  });
}

export function useEditPlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      playerData,
    }: { principal: any; playerData: Player }) => {
      if (!actor) throw new Error("Not connected");
      return actor.editPlayer(principal, playerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvedPlayers"] });
      queryClient.invalidateQueries({
        queryKey: ["allApplicationsWithPrincipals"],
      });
    },
  });
}

export function useBanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (principal: any) => {
      if (!actor) throw new Error("Not connected");
      return actor.banUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bannedUsers"] });
      queryClient.invalidateQueries({
        queryKey: ["allApplicationsWithPrincipals"],
      });
    },
  });
}

export function useUnbanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (principal: any) => {
      if (!actor) throw new Error("Not connected");
      return actor.unbanUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bannedUsers"] });
    },
  });
}

export function useBannedUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ["bannedUsers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getBannedUsers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignTester() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (principal: any) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignTesterRole(principal);
    },
  });
}

export function useRevokeTester() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (principal: any) => {
      if (!actor) throw new Error("Not connected");
      return actor.revokeTesterRole(principal);
    },
  });
}

export function useAllProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<ProfileEntry[]>({
    queryKey: ["allProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllProfiles();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isLoggedIn, principal } = useAuth();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile", principal],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getCallerUserProfile();
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: isLoggedIn && !!actor && !actorFetching,
    // Retry up to 3 times so transient backend errors don't leave username blank
    retry: 3,
    retryDelay: 1000,
    // Keep previous data visible while refetching
    placeholderData: (prev) => prev,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const { principal } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: (_data, variables) => {
      // Immediately update the cached callerProfile so navbar updates instantly
      queryClient.setQueryData(["callerProfile", principal], variables);
      // Invalidate all dependent queries to refetch with new username
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["callerProfileEntry"] });
      queryClient.invalidateQueries({ queryKey: ["approvedPlayers"] });
      queryClient.invalidateQueries({ queryKey: ["allProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["player"] });
    },
  });
}

export function useAssignPlayerTags() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      tags,
    }: { principal: any; tags: PlayerTag[] }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignPlayerTags(principal, tags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProfiles"] });
    },
  });
}

export function useAdminCreatePendingApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (principal: any) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminCreatePendingApplication(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allApplicationsWithPrincipals"],
      });
    },
  });
}

export function useAdminUpdatePendingRanks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      playerData,
    }: { principal: any; playerData: Player }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminUpdatePendingRanks(principal, playerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allApplicationsWithPrincipals"],
      });
    },
  });
}

export function useTesterSubmitForOtherPlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      target,
      playerData,
    }: { target: any; playerData: Player }) => {
      if (!actor) throw new Error("Not connected");
      // testerSubmitForOtherPlayer exists on Backend class but not on the
      // backendInterface type — cast to any so runtime dispatch reaches the
      // Backend method which handles Tier → Candid variant conversion.
      return (actor as any).testerSubmitForOtherPlayer(target, playerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allApplicationsWithPrincipals"],
      });
    },
  });
}

export function useCallerProfileEntry() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isLoggedIn, principal } = useAuth();
  return useQuery<ProfileEntry | null>({
    queryKey: ["callerProfileEntry", principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      try {
        const { Principal } = await import("@icp-sdk/core/principal");
        const p = Principal.fromText(principal);
        return await actor.getProfileEntry(p);
      } catch {
        return null;
      }
    },
    enabled: isLoggedIn && !!actor && !actorFetching && !!principal,
  });
}
