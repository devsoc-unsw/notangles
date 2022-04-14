import React from 'react';
import { Close } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/system';

import { CustomModalProps } from '../../interfaces/PropTypes';

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

const StyledTypography = styled(Typography)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const ShowModalButton = styled(IconButton)`
  margin-right: 5px;
`;

const StyledDialogContent = styled(DialogContent)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 20px;
`;

const CustomModal: React.FC<CustomModalProps> = ({ title, showIcon, description, content }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Tooltip title={title}>
        <ShowModalButton color="inherit" onClick={toggleIsOpen}>
          {showIcon}
        </ShowModalButton>
      </Tooltip>
      <Dialog
        disableScrollLock
        onClose={toggleIsOpen}
        aria-labelledby="customized-dialog-title"
        open={isOpen}
        fullWidth
        maxWidth="sm"
      >
        <StyledDialogTitle>
          <StyledTypography variant="h5">{description}</StyledTypography>
          <CloseButton color="inherit" aria-label="close" onClick={toggleIsOpen}>
            <Close />
          </CloseButton>
        </StyledDialogTitle>
        <Divider />
        <StyledDialogContent>{content}</StyledDialogContent>
      </Dialog>
    </>
  );
};

export default CustomModal;
