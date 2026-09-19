import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useTheme from "../hooks/useTheme";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  useTheme();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F2] dark:bg-[#0F1210] text-[#16160F] dark:text-[#F2F1EC] transition-colors duration-150">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#1B4332] dark:border-[#3FA873] border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6858] dark:text-[#F2F1EC]">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
