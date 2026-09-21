import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import { APP_NAME, APP_TAGLINE } from "../config/app";

// inverted = white text and mark, for use on the navy sidebars.
export default function Brand({ inverted = false, showTagline = true }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: inverted ? "#fff" : "primary.main",
          color: inverted ? "primary.main" : "#fff",
        }}
      >
        <SchoolOutlined />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, lineHeight: 1.2, color: inverted ? "#fff" : "text.primary" }}>
          {APP_NAME}
        </Typography>
        {showTagline && (
          <Typography variant="body2" sx={{ color: inverted ? alpha("#fff", 0.7) : "text.secondary" }}>
            {APP_TAGLINE}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
