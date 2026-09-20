import { useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const CustomPasswordField = ({
  label = "Password",
  placeholder,
  value,
  onChange,
  name,
  error = false,
  helperText,
  required = false,
  disabled = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <TextField
      fullWidth
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      type={showPassword ? "text" : "password"}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      variant="outlined"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleTogglePassword}
                edge="end"
                disabled={disabled}
                aria-label={
                  showPassword
                    ? "hide password"
                    : "show password"
                }
              >
                {showPassword ? (
                  <VisibilityOff />
                ) : (
                  <Visibility />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 1,
          backgroundColor: "background.paper",

          "& fieldset": {
            borderColor: "divider",
          },

          "&:hover fieldset": {
            borderColor: "text.secondary",
          },

          "&.Mui-focused fieldset": {
            borderColor: "primary.main",
            borderWidth: "1px",
          },

          "&.Mui-error fieldset": {
            borderColor: "error.main",
          },
        },

        "& .MuiInputLabel-root": {
          color: "text.secondary",
        },

        "& .MuiInputLabel-root.Mui-focused": {
          color: "primary.main",
        },

        ...props.sx,
      }}
    />
  );
};

export default CustomPasswordField;