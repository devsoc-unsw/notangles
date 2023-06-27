import React from 'react';
import { Box, Button, Dialog } from '@mui/material';
import { styled } from '@mui/system';

import { DiscardDialogProps } from '../../interfaces/PropTypes';
import { StyledDialogContent, StyledTitleContainer } from '../../styles/ControlStyles';

const StyledDialogButtons = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  padding-bottom: 5px;
  padding-right: 5px;
`;

const DiscardDialog: React.FC<DiscardDialogProps> = ({
  openSaveDialog,
  handleDiscardChanges,
  setIsEditing,
  setOpenSaveDialog,
}) => {
  return (
    <Dialog maxWidth="xs" open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
      {/* This dialog pops up when user tries to exit with unsaved editing changes */}
      <StyledTitleContainer>
        <StyledDialogContent>Discard unsaved changes?</StyledDialogContent>
      </StyledTitleContainer>
      <StyledDialogButtons>
        <Button
          onClick={() => {
            setOpenSaveDialog(false);
            setIsEditing(true);
          }}
        >
          Cancel
        </Button>
        <Button onClick={() => handleDiscardChanges()}>Discard</Button>
      </StyledDialogButtons>
    </Dialog>
  );
};

export default DiscardDialog;
