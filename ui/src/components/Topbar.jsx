import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
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
      sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton
          edge="start"
          aria-label="Open navigation"
          onClick={onMenuClick}
          sx={{ display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <UserAvatar name={displayName} size={32} />
          <Typography sx={{ display: { xs: "none", sm: "block" }, fontWeight: 600 }}>
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
