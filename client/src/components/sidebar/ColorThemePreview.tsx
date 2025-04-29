import { List, ListItem } from '@mui/material';
import { styled } from '@mui/system';
import { useMemo } from 'react';

import { colors } from '../../constants/timetable';
import { useColorDecoder } from '../../hooks/useColorDecoder';

const StyledPreviewContainer = styled(List)`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  padding: 0 0.7rem;
`;

const StyledListItem = styled(ListItem)<{
  backgroundColor: string;
  preveiewTheme?: string;
}>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  width: 10px;
  height: 10px;
  border-radius: 1rem;
  box-shadow: 2px 2px 2px 0px rgba(0, 0, 0, 0.1);
`;

interface ColorThemePreviewProps {
  previewTheme?: string;
}

export const ColorThemePreview = ({ previewTheme }: ColorThemePreviewProps) => {
  const colorPreview = useMemo(() => {
    return colors.map((color) => (
      <StyledListItem key={color} backgroundColor={useColorDecoder(color, previewTheme)} preveiewTheme={previewTheme} />
    ));
  }, [colors, previewTheme]);

  return <StyledPreviewContainer>{colorPreview}</StyledPreviewContainer>;
};
