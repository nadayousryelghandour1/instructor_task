import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Drawer } from "@mui/material";
import SidebarNav from "./SidebarNav";
import Topbar from "./Topbar";

const DRAWER_WIDTH = 250;

const paperSx = {
  width: DRAWER_WIDTH,
  bgcolor: "#f4f7fb",
  color: "#0f172a",
  border: 0,
  borderRight: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "none",
};

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, rgba(76, 122, 255, 0.18), transparent 45%), #0b1733",
        px: { xs: 1.5, md: 2 },
        py: { xs: 1.5, md: 2 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1500,
          mx: "auto",
          minHeight: "calc(100vh - 32px)",
          display: "flex",
          borderRadius: 3,
          overflow: "hidden",
          background: "#eef3fb",
          border: "1px solid rgba(148,163,184,0.2)",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.18)",
        }}
      >
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

        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#ecf2fb" }}>
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <Box component="main" sx={{ p: { xs: 1.5, md: 2.5 }, flex: 1, background: "#ecf2fb" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
