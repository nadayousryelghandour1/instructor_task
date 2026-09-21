import MuiAlert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

// variant: "error" | "success" | "warning" | "info"
export default function Alert({ title, variant = "info", children, ...props }) {
  return (
    <MuiAlert severity={variant} {...props}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
}
