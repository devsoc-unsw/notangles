import React from 'react';
import styled from 'styled-components';
import { Dialog, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from '@mui/material';
import { Close, Description } from '@mui/icons-material';

import ChangeLogContent from './ChangelogContent';

const StyledDialogTitle = styled(DialogTitle)`
  margin: 0;
  padding: 20px;
`;

const StyledTypography = styled(Typography)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  right: 10px;
  top: 10px;
`;

const InfoButton = styled(IconButton)`
  margin-right: 5px;
`;

const StyledDialogContent = styled(DialogContent)`
  padding: 20px;
`;

const Changelog: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Tooltip title="Changelog">
        <InfoButton color="inherit" onClick={toggleIsOpen}>
          <Description />
        </InfoButton>
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
          <StyledTypography variant="h5">Changelog</StyledTypography>
          <CloseButton color="inherit" aria-label="close" onClick={toggleIsOpen}>
            <Close />
          </CloseButton>
        </StyledDialogTitle>
        <StyledDialogContent>
          <ChangeLogContent />
        </StyledDialogContent>
      </Dialog>
    </>
  );
};

export default Changelog;
