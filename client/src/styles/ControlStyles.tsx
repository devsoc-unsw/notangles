import { Box } from '@mui/material';
import { styled } from '@mui/system';

export const StyledControlsButton = styled('div')`
  display: flex;
`;

export const ColourIndicatorBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'backgroundColour',
})<{
  backgroundColour: string;
}>`
  width: 35px;
  height: 35px;
  border-radius: 5px;
  background-color: ${({ backgroundColour }) => backgroundColour};
  &:hover {
    cursor: pointer;
  }
`;

export const StyledButtonContainer = styled(Box)`
  padding-left: 16px;
`;
