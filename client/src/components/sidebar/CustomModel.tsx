import { Close } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, Divider, IconButton, styled, Typography } from '@mui/material';
import { ReactNode } from 'react';

const StyledDialogContent = styled(DialogContent)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 20px;
`;

const StyledDialogTitle = styled(DialogTitle)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  margin: 0;
  padding: 20px;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  right: 10px;
  top: 10px;
`;

interface CustomModalProps {
  description: string;
  content: ReactNode;
  toggleIsOpen: () => void;
  isOpen: boolean;
}

const CustomModal = ({ description, content, toggleIsOpen, isOpen }: CustomModalProps) => {
  return (
    <Dialog
      disableScrollLock
      onClose={toggleIsOpen}
      aria-labelledby="customized-dialog-title"
      open={isOpen}
      fullWidth
      maxWidth="sm"
    >
      <StyledDialogTitle id="customized-dialog-title">
        <Typography variant="h5" component="span" sx={{ marginTop: '10px', marginBottom: '10px', display: 'block' }}>
          {description}
        </Typography>
        <CloseButton color="inherit" aria-label="close" onClick={toggleIsOpen}>
          <Close />
        </CloseButton>
      </StyledDialogTitle>
      <Divider />
      <StyledDialogContent>{content}</StyledDialogContent>
    </Dialog>
  );
};

export default CustomModal;
