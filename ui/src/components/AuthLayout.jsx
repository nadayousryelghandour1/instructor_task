import { Box } from "@mui/material";

export default function AuthLayout({ sidebar, children, ...props }) {
  return (
    <Box
      {...props}
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
        ...props.sx,
      }}
    >
      {sidebar}

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, md: 6 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
