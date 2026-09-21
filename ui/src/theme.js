import { createTheme, alpha } from "@mui/material/styles";

// Colours come from the "Calm Enterprise Academy" design system.
const { augmentColor } = createTheme().palette;
const tertiary = augmentColor({ color: { main: "#291000" }, name: "tertiary" });
const neutral = augmentColor({ color: { main: "#1e293b" }, name: "neutral" });

const theme = createTheme({
  palette: {
    primary: { main: "#0b1533" },
    secondary: { main: "#2563eb" },
    tertiary,
    neutral,
    info: { main: "#2563eb" },
    error: { main: "#b42318" },
    success: { main: "#067647" },
    warning: { main: "#b54708" },
    background: { default: "#f4f6fb", paper: "#ffffff" },
    text: { primary: "#1e293b", secondary: "#5b6478" },
    divider: "#dfe4f0",
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
    // Nothing in the UI is smaller than 13px so it stays readable in recordings.
    caption: { fontSize: "0.8125rem" },
    overline: { fontSize: "0.8125rem" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 6, padding: "10px 16px" },
        containedPrimary: {
          "&.Mui-disabled": { backgroundColor: "#0b1533", color: "#fff", opacity: 0.6 },
        },
        outlinedInherit: ({ theme }) => ({
          borderColor: theme.palette.divider,
          "&:hover": { borderColor: theme.palette.primary.main },
        }),
      },
    },
    MuiTextField: { defaultProps: { fullWidth: true, variant: "outlined" } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          "& fieldset": { borderColor: theme.palette.divider },
          "&:hover fieldset": { borderColor: theme.palette.text.secondary },
          "&.Mui-focused fieldset": { borderColor: theme.palette.secondary.main, borderWidth: 1 },
          "&.Mui-error fieldset": { borderColor: theme.palette.error.main },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({ "&.Mui-focused": { color: theme.palette.secondary.main } }),
      },
    },
    MuiLink: { defaultProps: { color: "secondary", underline: "hover" } },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 12 } },
    },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 700 } } },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({ borderColor: theme.palette.divider, padding: "14px 16px" }),
        head: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          color: theme.palette.text.secondary,
          fontWeight: 600,
          fontSize: "0.8125rem",
        }),
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          fontWeight: 600,
          paddingInline: 14,
          "&.Mui-selected, &.Mui-selected:hover": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
        }),
      },
    },
  },
});

export default theme;
