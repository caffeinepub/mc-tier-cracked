import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Application, Tier as BackendTier } from "../backend.d";
import type { Player as LocalPlayer } from "../data/dummyData";
import { backendPlayerToLocal } from "../utils/playerUtils";
import { useActor } from "./useActor";

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
    },
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
