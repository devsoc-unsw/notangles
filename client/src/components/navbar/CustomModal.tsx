import { Close } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

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
  display: flex;
  flex-direction: row;
  gap: 16px;
  border-radius: 8px;
  justify-content: flex-start;
  padding: 12px 12px 12px 12px;
`;

const StyledDialogContent = styled(DialogContent)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 20px;
`;

const IndividualComponentTypography = styled(Typography)`
  margin: 0px;
  fontsize: 16px;
`;

const CustomModal: React.FC<CustomModalProps> = ({ title, toolTipTitle, showIcon, description, content, collapsed, isClickable }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleIsOpen = () => {
    if (isClickable) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      <Tooltip title={collapsed ? toolTipTitle : ''} placement="right">
        <ShowModalButton color="inherit" onClick={toggleIsOpen}>
          {showIcon}
          <IndividualComponentTypography>{collapsed ? '' : title}</IndividualComponentTypography>
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
          <CloseButton color="inherit" aria-label="close" onClick={toggleIsOpen} >
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
