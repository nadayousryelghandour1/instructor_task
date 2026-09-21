import { Navigate } from "react-router-dom";
import { useAuth } from "../provider/useAuth";
import EmptyState from "./EmptyState";

// Sends signed-out visitors to /login.
export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// Shows a message when the role is not allowed. This is a courtesy: the API must enforce the same rule.
export function RoleRoute({ allow, children }) {
  const { user } = useAuth();
  if (allow.includes(user?.role)) return children;
  return (
    <EmptyState
      title="You don't have access to this page"
      description="Ask an admin of your organisation if you need it."
    />
  );
}
