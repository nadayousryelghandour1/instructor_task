import { Box, Typography } from "@mui/material";

export default function PageHeader({ title, description, action }) {
  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
