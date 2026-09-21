import { Box, Typography } from "@mui/material";

export default function EmptyState({ title, description, action, sx }) {
  return (
    <Box sx={{ py: 6, px: 3, textAlign: "center", ...sx }}>
      <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
      {description && (
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
