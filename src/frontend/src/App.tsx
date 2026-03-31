import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./hooks/useAuth";
import AdminPage from "./pages/AdminPage";
import GamemodePage from "./pages/GamemodePage";
import GamemodesPage from "./pages/GamemodesPage";
import HomePage from "./pages/HomePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import TesterPage from "./pages/TesterPage";

export { Link, useNavigate, useParams };

function Layout() {
  return (
    <AuthProvider>
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#0B0D10" }}
      >
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster />
    </AuthProvider>
  );
}

const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const gamemodesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/gamemodes",
  component: GamemodesPage,
});

const gamemodeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/gamemodes/$id",
  component: GamemodePage,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboard",
  component: LeaderboardPage,
});

const playerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/players/$username",
  component: PlayerProfilePage,
});

const testerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tester",
  component: TesterPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  gamemodesRoute,
  gamemodeRoute,
  leaderboardRoute,
  playerRoute,
  testerRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
