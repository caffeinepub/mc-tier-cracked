import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    smpPvpTier: Tier;
    username: string;
    axePvpTier: Tier;
    crystalPvpTier: Tier;
    cartPvpTier: Tier;
    overallTier: Tier;
    nethpotTier: Tier;
    discord?: string;
    macePvpTier: Tier;
    uhcTier: Tier;
    swordPvpTier: Tier;
}
export interface Application {
    status: ApplicationStatus;
    player: Player;
    reviewer?: Principal;
}
export type Principal = Principal;
export interface UserProfile {
    name: string;
    role: string;
}
export enum ApplicationStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum Gamemode {
    all = "all",
    uhc = "uhc",
    smpPvp = "smpPvp",
    axePvp = "axePvp",
    swordPvp = "swordPvp",
    nethpot = "nethpot",
    crystalPvp = "crystalPvp",
    macePvp = "macePvp",
    cartPvp = "cartPvp"
}
export enum Tier {
    ht1 = "ht1",
    ht2 = "ht2",
    ht3 = "ht3",
    ht4 = "ht4",
    ht5 = "ht5",
    lt1 = "lt1",
    lt2 = "lt2",
    lt3 = "lt3",
    lt4 = "lt4",
    lt5 = "lt5",
    mt1 = "mt1",
    mt2 = "mt2",
    mt3 = "mt3",
    mt4 = "mt4",
    mt5 = "mt5",
    none = "none"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignTesterRole(user: Principal): Promise<void>;
    deletePlayer(targetPlayer: Principal): Promise<void>;
    editPlayer(targetPlayer: Principal, playerData: Player): Promise<void>;
    getApplication(userToReview: Principal): Promise<Application>;
    getByGamemode(gamemode: Gamemode): Promise<Array<Player>>;
    getByTier(tier: Tier): Promise<Array<Player>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<Player>>;
    getOwnedApplications(): Promise<Array<Application>>;
    getPlayerByUsername(username: string): Promise<Player>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllApprovedPlayers(): Promise<Array<Player>>;
    listAllPendingApplications(): Promise<Array<Application>>;
    listAllUsernames(): Promise<Array<string>>;
    reviewApplication(userToReview: Principal, approve: boolean): Promise<void>;
    revokeTesterRole(user: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitApplication(username: string, discord: string | null, axePvp: Tier, swordPvp: Tier, crystalPvp: Tier, uhc: Tier, nethpot: Tier, smpPvp: Tier, macePvp: Tier, cartPvp: Tier, overall: Tier): Promise<void>;
}
