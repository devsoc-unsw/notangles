import { Box } from '@mui/material';
import { styled } from '@mui/system';

export const StyledButtonText = styled(Box)`
  margin-top: 3px;
  margin-left: 1px;
  flex-grow: 1;
`;

export const StyledControlsButton = styled('div')`
  display: flex;
`;

export const ColorIndicatorBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'backgroundColor',
})<{
  backgroundColor: string;
}>`
  width: 35px;
  height: 35px;
  border-radius: 5px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  &:hover {
    cursor: pointer;
  }
`;

export const StyledButtonContainer = styled(Box)`
  padding-left: 16px;
`;
