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
                  {/* Public User & Portfolio Routes */}
                  <Route path="/users/:id" element={<PublicProfile />} />
                  <Route path="/profile/:id" element={<PublicProfile />} />
                  <Route path="/portfolio/user/:userId" element={<PortfolioPage />} />
                  <Route path="/portfolio/:userId" element={<PortfolioPage />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Home />} />
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