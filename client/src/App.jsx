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
import SwapRequestsPage from "./pages/SwapRequestsPage";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <SocketProvider>
          <SwapProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/users/:id" element={<PublicProfile />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/swaps" element={<SwapRequestsPage />} />
                <Route path="/profile" element={<OwnProfile />} />
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