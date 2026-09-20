import { TextField } from "@mui/material";

const CustomTextField = ({
  label,
  placeholder,
  value,
  onChange,
  name,
  type = "text",
  error = false,
  helperText,
  required = false,
  disabled = false,
  ...props
}) => {
  return (
    <TextField
      fullWidth
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      type={type}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      variant="outlined"
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

export default CustomTextField;