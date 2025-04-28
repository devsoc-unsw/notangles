import { List, ListItem } from "@mui/material";

import { colors } from "../../constants/timetable";
import { useColorDecoder } from "../../hooks/useColorDecoder";

interface ColorThemePreviewProps {
  previewTheme?: string;
}

export const ColorThemePreview = ({ previewTheme }: ColorThemePreviewProps) => {
  return (
    <List sx={{ display: "flex", flexDirection: "row", gap: 1, paddingX: 0, paddingY: 1}}>

      {colors.map((color) => (
        <ListItem
          key={color}
          sx={{
            backgroundColor: useColorDecoder(color, previewTheme),
            width: 10,
            height: 10,
            borderRadius: 1,
            boxShadow: 2,
          }}
        />
      ))}        
    </List>
  
  )
};
