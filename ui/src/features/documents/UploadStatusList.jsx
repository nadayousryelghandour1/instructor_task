import { Box, Typography } from "@mui/material";
import Button from "../../components/Button";
import StatusBadge from "../../components/StatusBadge";

// One row per file the user just sent: uploading, uploaded, or failed with the reason.
export default function UploadStatusList({ items, onClear }) {
  if (items.length === 0) return null;
  const busy = items.some((item) => item.status === "uploading");

  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper", p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography sx={{ fontWeight: 600 }}>Uploads</Typography>
        <Button variant="secondary" size="small" onClick={onClear} disabled={busy}>
          Clear finished
        </Button>
      </Box>
      <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 1 }}>
        {items.map((item) => (
          <Box component="li" key={item.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Typography sx={{ overflowWrap: "anywhere" }}>{item.name}</Typography>
            <StatusBadge status={item.status} />
            {item.message && (
              <Typography variant="body2" color={item.status === "failed" ? "error" : "text.secondary"}>
                {item.message}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
