import Badge from "./Badge";
import { STATUSES, normalizeStatus, statusLabel } from "../config/statuses";

export default function StatusBadge({ status }) {
  const known = STATUSES[normalizeStatus(status)];
  return <Badge tone={known?.tone ?? "neutral"} label={statusLabel(status)} />;
}
