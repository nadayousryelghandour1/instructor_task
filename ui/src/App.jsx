import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import { ProtectedRoute, RoleRoute } from "./components/RouteGuards";
import LoginPage from "./pages/LoginPage";
import CreateOrgPage from "./pages/CreateOrgPage";
import UsersPage from "./pages/UsersPage";
import PlaceholderPage from "./pages/PlaceholderPage";

// The Router itself lives in main.jsx. Never render a second one here.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create-org" element={<CreateOrgPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/ask" replace />} />
        <Route path="ask" element={<PlaceholderPage title="Ask" />} />
        <Route path="documents" element={<PlaceholderPage title="Documents" />} />
        <Route path="workflows" element={<PlaceholderPage title="Workflows" />} />
        <Route path="approvals" element={<PlaceholderPage title="Approvals" />} />
        <Route path="runs" element={<PlaceholderPage title="Runs" />} />
        <Route
          path="users"
          element={
            <RoleRoute allow={["admin"]}>
              <UsersPage />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
