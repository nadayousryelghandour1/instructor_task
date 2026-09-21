import Badge from "./Badge";
import { ROLES } from "../config/roles";

export default function RoleBadge({ role }) {
  const known = ROLES[role];
  return <Badge tone={known?.tone ?? "neutral"} label={known?.label ?? (role || "Unknown")} />;
}
