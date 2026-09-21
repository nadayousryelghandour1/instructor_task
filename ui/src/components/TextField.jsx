import MuiTextField from "@mui/material/TextField";

// Look and defaults live in theme.js. This wrapper is the single place to change behaviour.
export default function TextField(props) {
  return <MuiTextField {...props} />;
}
