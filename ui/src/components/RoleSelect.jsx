import { Box, FormControl, FormLabel, Radio, RadioGroup, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ROLES, ROLE_ORDER } from "../config/roles";

// Radio cards, one per role. Descriptions come from config/roles.js.
export default function RoleSelect({ value, onChange, disabled = false }) {
  return (
    <FormControl disabled={disabled}>
      <FormLabel id="role-select-label" sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}>
        Role
      </FormLabel>
      <RadioGroup
        aria-labelledby="role-select-label"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        sx={{ gap: 1 }}
      >
        {ROLE_ORDER.map((key) => {
          const selected = value === key;
          return (
            <Box
              key={key}
              component="label"
              sx={(theme) => ({
                display: "flex",
                gap: 1.5,
                p: 1.5,
                cursor: disabled ? "default" : "pointer",
                border: 1,
                borderRadius: 2,
                borderColor: selected ? "secondary.main" : "divider",
                bgcolor: selected ? alpha(theme.palette.secondary.main, 0.06) : "background.paper",
              })}
            >
              <Radio value={key} color="secondary" sx={{ p: 0, mt: 0.25 }} />
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{ROLES[key].label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {ROLES[key].description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </RadioGroup>
    </FormControl>
  );
}
