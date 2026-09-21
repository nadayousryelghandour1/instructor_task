import { NavLink } from "react-router-dom";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import Brand from "./Brand";
import { NAV_SECTIONS } from "../config/nav";
import { useAuth } from "../provider/useAuth";

export default function SidebarNav({ onNavigate }) {
  const { user } = useAuth();

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || item.roles.includes(user?.role)),
  })).filter((section) => section.items.length > 0);

  return (
    <Box sx={{ px: 1.75, py: 2.5, display: "flex", flexDirection: "column", gap: 2.5, height: "100%", background: "#edf3fb" }}>
      <Box sx={{ px: 0.5, py: 0.5 }}>
        <Brand showTagline={false} />
      </Box>

      {sections.map((section, index) => (
        <Box key={section.title ?? index}>
          {section.title && (
            <Typography variant="caption" sx={{ px: 1.2, mb: 1, display: "block", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700 }}>
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
                  borderRadius: 1.75,
                  px: 1.2,
                  py: 1,
                  color: "#334155",
                  background: "transparent",
                  "&:hover": { background: "rgba(148,163,184,0.12)" },
                  "&.active": {
                    background: "linear-gradient(90deg, rgba(37,99,235,0.12), rgba(37,99,235,0.04))",
                    color: "#0f172a",
                    boxShadow: "inset 0 0 0 1px rgba(37,99,235,0.06)",
                  },
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
