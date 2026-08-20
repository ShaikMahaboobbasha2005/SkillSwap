import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { SwapProvider } from "./context/SwapContext";
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

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <SocketProvider>
          <SwapProvider>
            <Routes>
              {/* Public Auth & User Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/users/:id" element={<PublicProfile />} />
              <Route path="/portfolio/user/:userId" element={<PortfolioPage />} />
              <Route path="/portfolio/:userId" element={<PortfolioPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/swaps" element={<SwapRequestsPage />} />
                <Route path="/chats" element={<ChatsPage />} />
                <Route path="/chats/:userId" element={<ChatsPage />} />
                <Route path="/swaps/:swapId/chat" element={<ChatPage />} />
                <Route path="/profile" element={<OwnProfile />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SwapProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;