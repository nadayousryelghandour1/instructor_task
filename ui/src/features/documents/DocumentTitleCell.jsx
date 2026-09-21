import { Box, Typography } from "@mui/material";
import PictureAsPdfOutlined from "@mui/icons-material/PictureAsPdfOutlined";
import SlideshowOutlined from "@mui/icons-material/SlideshowOutlined";
import ArticleOutlined from "@mui/icons-material/ArticleOutlined";
import InsertDriveFileOutlined from "@mui/icons-material/InsertDriveFileOutlined";

const FILE_ICONS = {
  pdf: { icon: PictureAsPdfOutlined, color: "error.main" },
  ppt: { icon: SlideshowOutlined, color: "warning.main" },
  pptx: { icon: SlideshowOutlined, color: "warning.main" },
  doc: { icon: ArticleOutlined, color: "secondary.main" },
  docx: { icon: ArticleOutlined, color: "secondary.main" },
};

export default function DocumentTitleCell({ document }) {
  const { icon: Icon, color } = FILE_ICONS[document.type] ?? {
    icon: InsertDriveFileOutlined,
    color: "text.secondary",
  };
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
      <Icon sx={{ color, flexShrink: 0 }} />
      <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>{document.title}</Typography>
    </Box>
  );
}
