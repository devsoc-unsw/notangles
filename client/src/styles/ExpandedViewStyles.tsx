import { DialogTitle, Box, DialogContent } from '@mui/material';
import { styled } from '@mui/system';

export const StyledDialogTitle = styled(DialogTitle)`
  padding: 8px 12px 8px 24px;
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

export const StyledDialogContent = styled(DialogContent)`
  padding-bottom: 20px;
`;
