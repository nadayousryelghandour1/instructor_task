import ChatBubbleOutlined from "@mui/icons-material/ChatBubbleOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import ListAltOutlined from "@mui/icons-material/ListAltOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";

// `roles` is optional. It only hides the link; the server must enforce access too.
export const NAV_SECTIONS = [
  {
    items: [
      { label: "Ask", path: "/ask", icon: ChatBubbleOutlined },
      { label: "Documents", path: "/documents", icon: DescriptionOutlined },
      { label: "Workflows", path: "/workflows", icon: AccountTreeOutlined },
      { label: "Approvals", path: "/approvals", icon: FactCheckOutlined },
      { label: "Runs", path: "/runs", icon: ListAltOutlined },
    ],
  },
  {
    title: "Administration",
    items: [{ label: "Users", path: "/users", icon: PeopleOutlined, roles: ["admin"] }],
  },
];
