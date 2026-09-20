import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";

export default function AuthSidebar({ steps = [], activeStep = 0, children }) {
  return (
    <Box
      sx={{
        width: 320, flexShrink: 0, px: 4, py: 6,
        bgcolor: "primary.main", color: "#fff",
        display: { xs: "none", md: "flex" },
        flexDirection: "column", gap: 6,
      }}
    >
      <Box>
        <Typography variant="h5" component="p" sx={{ fontWeight: 700, letterSpacing: "-0.3px" }}>
          Domain Copilot
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 14, color: alpha("#fff", 0.7) }}>
          Education Intelligence Platform
        </Typography>
      </Box>

      {children}

      {steps.length > 0 && (
        <Box>
          <Typography variant="overline" sx={{ color: alpha("#fff", 0.6) }}>
            Setup
          </Typography>
          <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 2 }}>
            {steps.map((s, i) => (
              <SidebarStep
                key={s.title}
                number={i + 1}
                {...s}
                status={i < activeStep ? "done" : i === activeStep ? "active" : "pending"}
              />
            ))}
          </Box>
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
        display: "flex", alignItems: "flex-start", gap: 1.75, p: 1.5, borderRadius: 1,
        bgcolor: active ? alpha("#fff", 0.08) : "transparent",
      }}
    >
      <Box
        sx={{
          width: 28, height: 28, flexShrink: 0, borderRadius: "50%", border: 1,
          borderColor: filled ? "#fff" : alpha("#fff", 0.35),
          bgcolor: filled ? "#fff" : "transparent",
          color: filled ? "primary.main" : alpha("#fff", 0.7),
          display: "grid", placeItems: "center", fontSize: 13,
        }}
      >
        {status === "done" ? <CheckIcon sx={{ fontSize: 16 }} /> : number}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{title}</Typography>
        <Typography sx={{ fontSize: 13, color: alpha("#fff", 0.65), lineHeight: 1.4 }}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
}