import Badge from "./Badge";
import { STATUSES } from "../config/statuses";

export default function StatusBadge({ status }) {
  const known = STATUSES[String(status).toLowerCase()];
  return <Badge tone={known?.tone ?? "neutral"} label={known?.label ?? (status || "Unknown")} />;
}
