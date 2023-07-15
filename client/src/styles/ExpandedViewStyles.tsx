import { Dialog, DialogTitle, Box, DialogContent } from '@mui/material';
import { styled, alpha } from '@mui/system';

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    boxShadow: '0 0 2px 1px rgb(0, 0, 0, 0.2)',
    opacity: '0.9 !important',
  },
  '& .MuiSvgIcon-root': {
    // color: theme.palette.grey[300],
  },
  // '& .MuiFormControl-root': {
  //   borderColor: theme.palette.grey[300],
  // },
  '& .MuiInputBase-root': {
    // color: theme.palette.grey[300],
  },
}));

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
