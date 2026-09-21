import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Link, Typography } from "@mui/material";
import { api } from "../api/client";
import { useFormFields } from "../hooks/useFormFields";
import AuthLayout from "../components/AuthLayout";
import AuthSidebar from "../components/AuthSidebar";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import Button from "../components/Button";
import Alert from "../components/Alert";

const STEPS = [
  { title: "Organisation", description: "Name your organisation" },
  { title: "Admin account", description: "Create the first Admin" },
];

const INITIAL = { organisationName: "", adminName: "", email: "", password: "", confirm: "" };

function validate(values) {
  const errors = {};
  if (!values.organisationName.trim()) errors.organisationName = "Enter the organisation name";
  if (!values.adminName.trim()) errors.adminName = "Enter your full name";
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid email address";
  if (values.password.length < 8) errors.password = "Use at least 8 characters";
  if (values.confirm !== values.password) errors.confirm = "Passwords do not match";
  return errors;
}

export default function CreateOrgPage() {
  const { values, setErrors, bind } = useFormFields(INITIAL);
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    // Step 1 only needs the organisation name; Enter moves on instead of submitting.
    if (step === 0) {
      const nextErrors = validate(values);
      const stepErrors = nextErrors.organisationName
        ? { organisationName: nextErrors.organisationName }
        : {};
      setErrors(stepErrors);
      if (!nextErrors.organisationName) setStep(1);
      return;
    }

    // Step 2 checks every field, because the form can be submitted without visiting step 1 again.
    setServerError("");
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (nextErrors.organisationName) {
      setStep(0);
      return;
    }
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      // ⚠️ Assumed field names. Confirm them against POST /onboard in /openapi.json.
      await api("/onboard", {
        method: "POST",
        body: {
          tenant_name: values.organisationName,
          admin_name: values.adminName,
          admin_email: values.email,
          admin_password: values.password,
        },
      });
      setCreated(true);
    } catch (err) {
      setServerError(err.status ? err.message : "Cannot reach the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      sidebar={
        <AuthSidebar
          title="Set up your organisation"
          description="Creating an organisation also creates its first Admin. The Admin adds everyone else afterwards."
          steps={STEPS}
          activeStep={created ? STEPS.length : step}
        />
      }
    >
      {created ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Alert variant="success" title="Organisation created">
            {values.organisationName} is ready. Sign in with the Admin account you just created.
          </Alert>
          <Button component={RouterLink} to="/login">
            Go to sign in
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
            {step === 0 ? "Create your organisation" : "Create the Admin account"}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {serverError && <Alert variant="error">{serverError}</Alert>}

            {step === 0 ? (
              <>
                <TextField label="Organisation name" {...bind("organisationName")} />
                <Button type="submit">Continue</Button>
              </>
            ) : (
              <>
                <TextField label="Full name" {...bind("adminName")} />
                <TextField label="Email" type="email" autoComplete="username" {...bind("email")} />
                <Box
                  sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}
                >
                  <PasswordField
                    autoComplete="new-password"
                    {...bind("password", "At least 8 characters")}
                  />
                  <PasswordField
                    label="Confirm password"
                    autoComplete="new-password"
                    {...bind("confirm")}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button variant="secondary" type="button" onClick={() => setStep(0)}>
                    Back
                  </Button>
                  <Button type="submit" loading={loading} loadingText="Creating...">
                    Create organisation
                  </Button>
                </Box>
              </>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            Already have an account?{" "}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </>
      )}
    </AuthLayout>
  );
}
