import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import Button from "./Button";
import RoleBadge from "./RoleBadge";
import UserAvatar from "./UserAvatar";
import { useAuth } from "../provider/useAuth";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.email || "Signed in";

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "1px solid rgba(148,163,184,0.22)",
        bgcolor: "#f5f8ff",
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: 68, px: 2.5 }}>
        <IconButton
          edge="start"
          aria-label="Open navigation"
          onClick={onMenuClick}
          sx={{ display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.25,
            py: 0.75,
            borderRadius: 2,
            background: "#e9eefb",
            color: "#475569",
            minWidth: 280,
          }}
        >
          <SearchIcon sx={{ fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569" }}>
            Search workspace
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <UserAvatar name={displayName} size={30} />
          <Typography sx={{ display: { xs: "none", sm: "block" }, fontWeight: 700, color: "#0f172a" }}>
            {displayName}
          </Typography>
          <RoleBadge role={user?.role} />
        </Box>

        <Button variant="secondary" size="small" startIcon={<LogoutIcon />} onClick={logout}>
          Sign out
        </Button>
      </Toolbar>
    </AppBar>
  );
}
