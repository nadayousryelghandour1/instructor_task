import { Box, Typography } from "@mui/material";
import StatusBadge from "../../components/StatusBadge";
import { isErrorStatus } from "../../config/statuses";

// The badge, plus the failure reason underneath when a document failed.
export default function DocumentStatusCell({ document }) {
  const showError = isErrorStatus(document.status) && document.error;
  return (
    <Box>
      <StatusBadge status={document.status} />
      {showError && (
        <Typography variant="body2" color="error" title={document.error} sx={{ mt: 0.5, maxWidth: 260 }}>
          {document.error}
        </Typography>
      )}
    </Box>
  );
}
