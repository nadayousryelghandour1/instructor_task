import { NavLink } from "react-router-dom";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Brand from "./Brand";
import { NAV_SECTIONS } from "../config/nav";
import { useAuth } from "../provider/useAuth";

// Navigation inside the app shell. Links come from config/nav.js, filtered by the user's role.
export default function SidebarNav({ onNavigate }) {
  const { user } = useAuth();

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || item.roles.includes(user?.role)),
  })).filter((section) => section.items.length > 0);

  return (
    <Box sx={{ px: 2, py: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ px: 1 }}>
        <Brand inverted showTagline={false} />
      </Box>

      {sections.map((section, index) => (
        <Box key={section.title ?? index}>
          {section.title && (
            <Typography variant="body2" sx={{ px: 1.5, mb: 0.5, color: alpha("#fff", 0.55) }}>
              {section.title}
            </Typography>
          )}
          <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {section.items.map(({ label, path, icon: Icon }) => (
              <ListItemButton
                key={path}
                component={NavLink}
                to={path}
                onClick={onNavigate}
                sx={{
                  borderRadius: 1.5,
                  color: alpha("#fff", 0.75),
                  "&:hover": { bgcolor: alpha("#fff", 0.06) },
                  "&.active": { bgcolor: alpha("#fff", 0.12), color: "#fff" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={label} slotProps={{ primary: { fontWeight: 600 } }} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
}
