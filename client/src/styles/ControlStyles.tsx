import { Box, DialogContent, DialogTitle, ListItem, Typography } from '@mui/material';
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

export const StyledTopIcons = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 10px 10px 0px 10px;
`;

export const StyledDialogButtons = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 12px;
  padding-bottom: 20px;
  padding-right: 32px;
`;

export const StyledDialogTitle = styled(DialogTitle)`
  padding: 8px 24px 8px 24px;
`;

export const StyledDialogContent = styled(DialogContent)`
  padding-bottom: 20px;
`;

export const StyledTitleContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  // align-items: center;
  height: 100%;
  width: 100%;
  padding-bottom: 10px;
  padding-top: 10px;
`;

export const StyledDialogTitleFont = styled(Typography)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
  padding-bottom: 10px;
`;

export const StyledListItem = styled(ListItem)`
  padding-top: 8px;
`;
