import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Drawer } from "@mui/material";
import SidebarNav from "./SidebarNav";
import Topbar from "./Topbar";

const DRAWER_WIDTH = 260;

const paperSx = { width: DRAWER_WIDTH, bgcolor: "primary.main", color: "#fff", border: 0 };

// Layout for every signed-in screen: navy sidebar + top bar + page content (<Outlet />).
export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": paperSx }}
      >
        <SidebarNav onNavigate={closeMobile} />
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": paperSx,
        }}
      >
        <SidebarNav />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <Box component="main" sx={{ p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
