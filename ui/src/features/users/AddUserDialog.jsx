import { useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { createUser } from "../../api/users";
import { useFormFields } from "../../hooks/useFormFields";
import { generatePassword } from "../../utils/password";
import TextField from "../../components/TextField";
import RoleSelect from "../../components/RoleSelect";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import { useAuth } from "../../provider/useAuth";

const INITIAL = { fullName: "", email: "", password: "", role: "instructor" };

function validate(values) {
  const errors = {};
  if (!values.fullName.trim()) errors.fullName = "Enter the user's full name";
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid email address";
  if (values.password.length < 8) errors.password = "Use at least 8 characters";
  return errors;
}

// The form is a child of the Dialog on purpose: MUI unmounts dialog content after it closes,
// so every time the dialog opens the form starts empty.
export default function AddUserDialog({ open, onClose, onCreated }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <AddUserForm onClose={onClose} onCreated={onCreated} />
    </Dialog>
  );
}

function AddUserForm({ onClose, onCreated }) {
  const { user: currentUser } = useAuth();
  const { values, setValues, setErrors, bind } = useFormFields(INITIAL);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    setValues((current) => ({ ...current, password: generatePassword() }));
    setErrors((current) => ({ ...current, password: "" }));
    setCopied(false);
  }

  async function handleCopy() {
    if (!values.password) return;
    try {
      await navigator.clipboard.writeText(values.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setServerError("Could not copy to the clipboard. Select the password and copy it manually.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const user = await createUser({
        ...values,
        tenantId: currentUser?.tenant_id,
      });
      onCreated(user);
    } catch (err) {
      if (err.status === 409) {
        setErrors({ email: "This email is already in use in this organisation" });
      } else {
        setServerError(err.status ? err.message : "Cannot reach the server");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <DialogTitle>Add user</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Create an account in your organisation and choose what the user can do.
        </DialogContentText>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {serverError && <Alert variant="error">{serverError}</Alert>}

          <TextField label="Full name" autoFocus {...bind("fullName")} />
          <TextField label="Email" type="email" autoComplete="off" {...bind("email")} />

          <Box>
            <TextField
              label="Initial password"
              autoComplete="new-password"
              {...bind("password", "At least 8 characters. Share it with the user securely.")}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={copied ? "Copied" : "Copy password"}>
                        <span>
                          <IconButton
                            edge="end"
                            aria-label="Copy password"
                            onClick={handleCopy}
                            disabled={!values.password}
                          >
                            {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button variant="secondary" size="small" type="button" onClick={handleGenerate} sx={{ mt: 1 }}>
              Generate secure password
            </Button>
          </Box>

          <RoleSelect
            value={values.role}
            onChange={(role) => setValues((current) => ({ ...current, role }))}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="secondary" type="button" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} loadingText="Creating...">
          Create user
        </Button>
      </DialogActions>
    </Box>
  );
}
