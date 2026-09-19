import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { SwapProvider } from "./context/SwapContext";
import { NotificationProvider } from "./context/NotificationContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import DiscoverPage from "./pages/DiscoverPage";
import OwnProfile from "./pages/OwnProfile";
import PublicProfile from "./pages/PublicProfile";
import PortfolioPage from "./pages/PortfolioPage";
import SwapRequestsPage from "./pages/SwapRequestsPage";
import ChatsPage from "./pages/ChatsPage";
import ChatPage from "./pages/ChatPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import useAuth from "./hooks/useAuth";

/**
 * RootRoute — Pre-login / Post-login Intelligent Dispatcher
 * Unauthenticated visitors view the 3D Scroll Landing Page.
 * Authenticated users view their interactive Home Dashboard.
 */
function RootRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F2] dark:bg-[#0F1210] text-[#16160F] dark:text-[#F2F1EC] transition-colors duration-150">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#1B4332] dark:border-[#3FA873] border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6858] dark:text-[#F2F1EC]">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Home />;
  }

  return <LandingPage />;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <SwapProvider>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Main Application Shell with Shared Mobile Navigation & Safe-Area Clearance */}
                <Route element={<AppLayout />}>
                  {/* Intelligent Root: LandingPage (guest) or Home (authenticated) */}
                  <Route path="/" element={<RootRoute />} />

                  {/* Public User & Portfolio Routes */}
                  <Route path="/users/:id" element={<PublicProfile />} />
                  <Route path="/profile/:id" element={<PublicProfile />} />
                  <Route path="/portfolio/user/:userId" element={<PortfolioPage />} />
                  <Route path="/portfolio/:userId" element={<PortfolioPage />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/discover" element={<DiscoverPage />} />
                    <Route path="/recommendations" element={<RecommendationsPage />} />
                    <Route path="/matches" element={<RecommendationsPage />} />
                    <Route path="/swaps" element={<SwapRequestsPage />} />
                    <Route path="/chats" element={<ChatsPage />} />
                    <Route path="/chats/:userId" element={<ChatsPage />} />
                    <Route path="/swaps/:swapId/chat" element={<ChatPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/profile" element={<OwnProfile />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SwapProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </Router>
);
}

export default App;