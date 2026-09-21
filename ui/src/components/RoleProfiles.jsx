import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ROLES, ROLE_ORDER } from "../config/roles";

// Read-only role cards for dark backgrounds (used on the sign-in sidebar).
export default function RoleProfiles() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {ROLE_ORDER.map((key) => {
        const { label, description, icon: Icon } = ROLES[key];
        return (
          <Box
            key={key}
            sx={{
              display: "flex",
              gap: 1.5,
              p: 1.75,
              borderRadius: 2,
              border: 1,
              borderColor: alpha("#fff", 0.12),
              bgcolor: alpha("#fff", 0.05),
            }}
          >
            <Icon sx={{ fontSize: 20, mt: 0.25, color: alpha("#fff", 0.85) }} />
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
              <Typography variant="body2" sx={{ color: alpha("#fff", 0.65), lineHeight: 1.4 }}>
                {description}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
