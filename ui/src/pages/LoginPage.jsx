import { useState } from "react";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import { Box, Link, Typography } from "@mui/material";
import { useAuth } from "../provider/useAuth";
import AuthLayout from "../components/AuthLayout";
import AuthSidebar from "../components/AuthSidebar";
import RoleProfiles from "../components/RoleProfiles";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import Button from "../components/Button";
import Alert from "../components/Alert";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (err.status === 401) setError("Invalid email or password");
      else setError(err.status ? err.message : "Cannot reach the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      sidebar={
        <AuthSidebar
          title="Curriculum and assessment design, grounded in your documents."
          description="Every answer is cited to its source, and every generated item is reviewed before it is approved."
        >
          <RoleProfiles />
        </AuthSidebar>
      }
    >
      <Typography variant="h4" component="h1">
        Sign in
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Use the account your organisation's admin created for you.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert variant="error">{error}</Alert>}
        <TextField
          label="Email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordField
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" loading={loading} loadingText="Signing in...">
          Sign in
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        New organisation?{" "}
        <Link component={RouterLink} to="/create-org">
          Create one
        </Link>
      </Typography>
    </AuthLayout>
  );
}
