import { Dialog, DialogTitle, Box, DialogContent } from '@mui/material';
import { styled, alpha } from '@mui/system';

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 10,
    borderStyle: 'solid',
    borderColor: alpha(theme.palette.grey[800], 0.85),
    borderWidth: 'thin',
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(2),
    minWidth: 180,
    color: theme.palette.grey[300],
    backgroundColor: alpha(theme.palette.grey[900], 0.9),
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.grey[300],
  },
  '& .MuiFormControl-root': {
    borderColor: theme.palette.grey[300],
  },
  '& .MuiInputBase-root': {
    color: theme.palette.grey[300],
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
