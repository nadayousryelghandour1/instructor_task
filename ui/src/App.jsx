import { Routes, Route, Navigate } from "react-router-dom";
import CreateOrgPage from "./pages/CreateOrgPage";

export default function App() {
  return (
    <Routes>
      <Route path="/create-org" element={<CreateOrgPage />} />

      <Route
        path="*"
        element={<Navigate to="/create-org" replace />}
      />
    </Routes>
  );
}