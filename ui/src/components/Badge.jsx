import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";

// tone: "neutral" | "primary" | "info" | "tertiary" | "success" | "warning" | "error"
function toneStyles(theme, tone) {
  const { palette } = theme;
  const soft = (main, text = main) => ({ backgroundColor: alpha(main, 0.12), color: text });

  switch (tone) {
    case "primary":
      return { backgroundColor: palette.primary.main, color: palette.primary.contrastText };
    case "info":
      return soft(palette.secondary.main, palette.secondary.dark);
    case "tertiary":
      return soft(palette.tertiary.main);
    case "success":
      return soft(palette.success.main);
    case "warning":
      return soft(palette.warning.main);
    case "error":
      return soft(palette.error.main);
    default:
      return soft(palette.neutral.main);
  }
}

export default function Badge({ tone = "neutral", label, ...props }) {
  return (
    <Chip
      size="small"
      label={label}
      sx={(theme) => ({ fontWeight: 600, ...toneStyles(theme, tone) })}
      {...props}
    />
  );
}
