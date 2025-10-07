import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Bypass authentication for SQLite version
  return <>{children}</>;
};

export default ProtectedRoute;
