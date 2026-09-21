import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import Brand from "./Brand";

// Left navy panel of the sign-in and create-organisation screens.
// Pass `steps` (+ `activeStep`) to show progress, or `children` for extra content.
export default function AuthSidebar({ title, description, steps = [], activeStep = 0, children }) {
  return (
    <Box
      sx={{
        width: 360,
        flexShrink: 0,
        px: 4,
        py: 6,
        bgcolor: "primary.main",
        color: "#fff",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        gap: 4,
      }}
    >
      <Brand inverted />

      {(title || description) && (
        <Box>
          {title && (
            <Typography variant="h5" component="h2" sx={{ lineHeight: 1.3 }}>
              {title}
            </Typography>
          )}
          {description && (
            <Typography sx={{ mt: 1.5, color: alpha("#fff", 0.7) }}>{description}</Typography>
          )}
        </Box>
      )}

      {children}

      {steps.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {steps.map((step, index) => (
            <SidebarStep
              key={step.title}
              number={index + 1}
              {...step}
              status={index < activeStep ? "done" : index === activeStep ? "active" : "pending"}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

function SidebarStep({ number, title, description, status }) {
  const active = status === "active";
  const filled = active || status === "done";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.75,
        p: 1.5,
        borderRadius: 1,
        bgcolor: active ? alpha("#fff", 0.08) : "transparent",
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          flexShrink: 0,
          borderRadius: "50%",
          border: 1,
          borderColor: filled ? "#fff" : alpha("#fff", 0.35),
          bgcolor: filled ? "#fff" : "transparent",
          color: filled ? "primary.main" : alpha("#fff", 0.7),
          display: "grid",
          placeItems: "center",
          fontSize: 13,
        }}
      >
        {status === "done" ? <CheckIcon sx={{ fontSize: 16 }} /> : number}
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: alpha("#fff", 0.65), lineHeight: 1.4 }}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
}
