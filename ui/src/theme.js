import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#0b1533" },
    error: { main: "#b42318" },
    success: { main: "#067647" },
    info: { main: "#175cd3" },
    background: { default: "#f4f6fb", paper: "#ffffff" },
    text: { primary: "#101828", secondary: "#5b6478" },
    divider: "#dfe4f0",
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 6, padding: "10px 16px" },
        containedPrimary: {
          "&.Mui-disabled": { backgroundColor: "#0b1533", color: "#fff", opacity: 0.6 },
        },
        outlinedInherit: { borderColor: "#dfe4f0", "&:hover": { borderColor: "#0b1533" } },
      },
    },
  },
});

export default theme;