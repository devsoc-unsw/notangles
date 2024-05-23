import { Box, DialogContent, DialogTitle, ListItem } from '@mui/material';
import { styled } from '@mui/system';

export const StyledButtonText = styled(Box)`
  margin-top: 3px;
  margin-left: 1px;
  flex-grow: 1;
`;

export const StyledControlsButton = styled('div')`
  display: flex;
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
  padding-bottom: 5px;
  padding-right: 5px;
`;

export const StyledDialogTitle = styled(DialogTitle)`
  padding: 8px 24px 8px 24px;
`;

export const StyledDialogContent = styled(DialogContent)`
  padding-bottom: 20px;
`;

export const StyledTitleContainer = styled(Box)`
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
