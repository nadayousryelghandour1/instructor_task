import { Box } from "@mui/material";
import Brand from "./Brand";

// Full-page split layout. `sidebar` is hidden on small screens, so the brand shows above the form instead.
export default function AuthLayout({ sidebar, children, ...props }) {
  return (
    <Box
      {...props}
      sx={{ minHeight: "100vh", display: "flex", bgcolor: "background.default", ...props.sx }}
    >
      {sidebar}

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, md: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 480 }}>
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 4 }}>
            <Brand showTagline={false} />
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
