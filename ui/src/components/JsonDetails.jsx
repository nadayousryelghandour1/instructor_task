import { useState } from "react";
import { Box, Collapse } from "@mui/material";
import Button from "./Button";

// "Show technical details" toggle that prints raw data as text. Useful while the API
// contract is still settling; text only, never HTML.
export default function JsonDetails({ data, label = "technical details" }) {
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <Button variant="secondary" size="small" onClick={() => setOpen((current) => !current)}>
        {open ? `Hide ${label}` : `Show ${label}`}
      </Button>
      <Collapse in={open} unmountOnExit>
        <Box
          component="pre"
          sx={{ mt: 1.5, p: 2, maxHeight: 360, overflow: "auto", borderRadius: 2, bgcolor: "action.hover", fontSize: 13, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
        >
          {JSON.stringify(data, null, 2)}
        </Box>
      </Collapse>
    </Box>
  );
}
