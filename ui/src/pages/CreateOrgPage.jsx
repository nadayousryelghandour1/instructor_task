import { useState } from "react";
import { Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";

import { api } from "../api/client";
import AuthLayout from "../components/AuthLayout";
import AuthSidebar from "../components/AuthSidebar";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import Button from "../components/Button";
import Alert from "../components/Alert";

const STEPS = [
  {
    title: "Organization",
    description: "Set up your organization",
  },
  {
    title: "Account",
    description: "Create your admin account",
  },
];

const initial = {
  organisationName: "",
  adminName: "",
  email: "",
  password: "",
  confirm: "",
};

function validate(form) {
  const errors = {};

  if (!form.organisationName.trim()) {
    errors.organisationName = "Required";
  }

  if (!form.adminName.trim()) {
    errors.adminName = "Required";
  }

  if (!form.email.trim()) {
    errors.email = "Required";
  }

  if (form.password.length < 8) {
    errors.password = "Minimum 8 characters";
  }

  if (form.confirm !== form.password) {
    errors.confirm = "Passwords do not match";
  }

  return errors;
}

export default function CreateOrgPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const bind = (field) => ({
    value: form[field],
    error: Boolean(errors[field]),
    helperText: errors[field],
    onChange: (e) => {
      const value = e.target.value;

      setForm((current) => ({
        ...current,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((current) => ({
          ...current,
          [field]: "",
        }));
      }
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();

    // Step 1
    if (step === 0) {
      const errors = form.organisationName.trim()
        ? {}
        : { organisationName: "Required" };

      setErrors(errors);

      if (!Object.keys(errors).length) {
        setStep(1);
      }

      return;
    }

    // Step 2
    setServerError("");

    const errors = validate(form);
    setErrors(errors);

    if (errors.organisationName) {
      setStep(0);
      return;
    }

    if (Object.keys(errors).length) {
      return;
    }

    setLoading(true);

    try {
      await api("/onboard", {
        method: "POST",
        body: {
          tenant_name: form.organisationName,
          admin_name: form.adminName,
          admin_email: form.email,
          admin_password: form.password,
        },
      });

      setCreated(true);
    } catch (err) {
      setServerError(
        err.status
          ? err.message
          : "Cannot reach the server"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      sidebar={
        <AuthSidebar
          steps={STEPS}
          activeStep={created ? STEPS.length : step}
        />
      }
    >
      {created ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Alert
            variant="success"
            title="Organisation created"
          >
            {form.organisationName} is ready. Sign in with the
            Admin account you just created.
          </Alert>

          <Button
            component={Link}
            to="/login"
          >
            Go to sign in
          </Button>
        </Box>
      ) : (
        <>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 3,
              fontWeight: 700,
            }}
          >
            {step === 0
              ? "Create your organisation"
              : "Create the Admin account"}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {serverError && (
              <Alert variant="error">
                {serverError}
              </Alert>
            )}

            {step === 0 ? (
              <>
                <TextField
                  label="Organisation name"
                  {...bind("organisationName")}
                />

                <Button type="submit">
                  Next →
                </Button>
              </>
            ) : (
              <>
                <TextField
                  label="Full name"
                  {...bind("adminName")}
                />

                <TextField
                  label="Email"
                  type="email"
                  autoComplete="username"
                  {...bind("email")}
                />

                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                    },
                  }}
                >
                  <PasswordField
                    label="Password"
                    autoComplete="new-password"
                    helperText={
                      errors.password || "Minimum 8 characters"
                    }
                    {...bind("password")}
                  />

                  <PasswordField
                    label="Confirm password"
                    autoComplete="new-password"
                    {...bind("confirm")}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                  }}
                >
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      setStep(0);
                      setErrors({});
                    }}
                  >
                    Back
                  </Button>

                  <Button
                    type="submit"
                    loading={loading}
                    loadingText="Creating..."
                  >
                    Create organisation →
                  </Button>
                </Box>
              </>
            )}
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 3 }}
          >
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </Typography>
        </>
      )}
    </AuthLayout>
  );
}