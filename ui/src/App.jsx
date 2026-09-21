import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import { ProtectedRoute, RoleRoute } from "./components/RouteGuards";
import LoginPage from "./pages/LoginPage";
import CreateOrgPage from "./pages/CreateOrgPage";
import UsersPage from "./pages/UsersPage";
import DocsPage from "./pages/DocsPage";
import WorkflowsPage from "./pages/WorkflowsPage";
import AskPage from "./pages/AskPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import RunsPage from "./pages/RunsPage";

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
        <Route path="ask" element={<AskPage />} />
        <Route path="documents" element={<DocsPage />} />
        <Route path="workflows" element={<WorkflowsPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="runs" element={<RunsPage />} />
        <Route path="runs/:runId" element={<RunsPage />} />
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
