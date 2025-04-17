import { List, ListItem } from "@mui/material";

import { colors } from "../../constants/timetable";
import { useColorDecoder } from "../../hooks/useColorDecoder";

interface ColorThemePreviewProps {
  p_theme?: string;
}

export const ColorThemePreview = ({ p_theme }: ColorThemePreviewProps) => {
  return (
    <List sx={{ display: "flex", flexDirection: "row", gap: 1, paddingX: 0, paddingY: 1}}>

      {colors.map((color) => (
        <ListItem
          key={color}
          sx={{
            backgroundColor: useColorDecoder(color, p_theme),
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