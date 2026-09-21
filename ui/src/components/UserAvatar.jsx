import Avatar from "@mui/material/Avatar";
import { initials } from "../utils/format";

export default function UserAvatar({ name, size = 36 }) {
  return (
    <Avatar sx={{ width: size, height: size, bgcolor: "primary.main", fontSize: 13, fontWeight: 600 }}>
      {initials(name)}
    </Avatar>
  );
}
