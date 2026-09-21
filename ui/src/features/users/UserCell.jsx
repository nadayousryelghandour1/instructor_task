import { Box, Typography } from "@mui/material";
import UserAvatar from "../../components/UserAvatar";

export default function UserCell({ user }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <UserAvatar name={user.name} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }}>{user.name || "Unnamed user"}</Typography>
        <Typography variant="body2" color="text.secondary">
          {user.email}
        </Typography>
      </Box>
    </Box>
  );
}
