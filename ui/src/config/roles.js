import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";

// Keys must match the role values your backend puts in the JWT and the user records.
// Descriptions must match what the server really enforces. Edit them here.
export const ROLES = {
  admin: {
    label: "Admin",
    tone: "primary",
    icon: AdminPanelSettingsOutlined,
    description: "Manages the organisation's users and their roles.",
  },
  lead_instructor: {
    label: "Lead Instructor",
    tone: "info",
    icon: FactCheckOutlined,
    description: "Does everything an Instructor does, and approves generated assessment items.",
  },
  instructor: {
    label: "Instructor",
    tone: "tertiary",
    icon: EditNoteOutlined,
    description: "Uploads documents, asks questions with citations and runs workflows.",
  },
};

export const ROLE_ORDER = ["admin", "lead_instructor", "instructor"];

// "Lead Instructor", "lead-instructor" and "lead_instructor" all become "lead_instructor".
export function normalizeRole(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}
