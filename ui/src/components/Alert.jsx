import MuiAlert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

const SEVERITY_MAP = {
  error: "error",
  success: "success",
  warning: "warning",
  info: "info",
};

export default function Alert({ title, variant = "info", children, ...props }) {
  const severity = SEVERITY_MAP[variant] || "info";

  return (
    <MuiAlert severity={severity} {...props}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
}
