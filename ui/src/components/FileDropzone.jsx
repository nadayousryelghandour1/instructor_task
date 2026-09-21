import { useRef, useState } from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import Button from "./Button";

// Drag-and-drop area with a "Browse files" fallback. It only hands the chosen files to
// `onFiles`; validating and uploading them is the page's job.
// `progress` (0-100) shows a bar while a file is being sent.
export default function FileDropzone({ accept, hint, onFiles, disabled = false, multiple = true, progress = null }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function emit(fileList) {
    const files = Array.from(fileList ?? []);
    if (files.length) onFiles(files);
  }

  return (
    <Box
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) emit(event.dataTransfer.files);
      }}
      sx={(theme) => ({
        p: 4,
        textAlign: "center",
        border: "2px dashed",
        borderRadius: 2,
        borderColor: dragging ? "secondary.main" : "divider",
        bgcolor: dragging ? alpha(theme.palette.secondary.main, 0.06) : "background.paper",
        opacity: disabled ? 0.7 : 1,
      })}
    >
      <UploadFileOutlined sx={{ fontSize: 36, color: "secondary.main" }} />
      <Typography sx={{ mt: 1, fontWeight: 600 }}>Drag and drop files here</Typography>
      <Typography variant="body2" color="text.secondary">
        {hint}
      </Typography>
      <Button
        variant="secondary"
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        sx={{ mt: 2 }}
      >
        Browse files
      </Button>
      {progress !== null && (
        <Box sx={{ mt: 2, mx: "auto", maxWidth: 360 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 999 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Uploading {progress}%
          </Typography>
        </Box>
      )}
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          emit(event.target.files);
          event.target.value = ""; // lets the same file be chosen again
        }}
      />
    </Box>
  );
}
