import { List, ListItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useMemo } from 'react';

import { colors } from '../../constants/timetable';
import { useColorDecoder } from '../../hooks/useColorDecoder';

const StyledPreviewContainer = styled(List)`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  padding: 0 0.7rem;
`;

const StyledListItem = styled(ListItem, { shouldForwardProp: (prop) => prop !== 'backgroundColor' })<{
  backgroundColor: string;
}>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  width: 10px;
  height: 10px;
  border-radius: 1rem;
  box-shadow: 2px 2px 2px 0px rgba(0, 0, 0, 0.1);
`;

interface ColorThemePreviewProps {
  previewTheme: string;
}

export const ColorThemePreview = ({ previewTheme }: ColorThemePreviewProps) => {
  const decodedColors = Object.fromEntries(
    Object.entries(colors).map(([key, color]) => {
      const decodedColor = useColorDecoder(color, previewTheme);
      return [key, decodedColor];
    }),
  );
  const colorPreview = useMemo(() => {
    return Object.values(decodedColors).map((color) => <StyledListItem key={color} backgroundColor={color} />);
  }, [colors, previewTheme]);

  return <StyledPreviewContainer>{colorPreview}</StyledPreviewContainer>;
};
