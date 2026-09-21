import MuiButton from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

const VARIANTS = {
  primary: { variant: "contained", color: "primary" },
  secondary: { variant: "outlined", color: "inherit" },
  danger: { variant: "contained", color: "error" },
};

export default function Button({
  variant = "primary",
  loading = false,
  loadingText = "Please wait...",
  disabled,
  startIcon,
  children,
  ...props
}) {
  return (
    <MuiButton
      {...VARIANTS[variant]}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      {...props}
    >
      {loading ? loadingText : children}
    </MuiButton>
  );
}
