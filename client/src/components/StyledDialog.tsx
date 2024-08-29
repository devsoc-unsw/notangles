import { Close as CloseIcon } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

const ContentContainer = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding-top: 10px;
`;

const StyledDialogTitleFont = styled('div')`
  font-size: 18px;
  font-weight: 500;
`;

const StyledDialogContent = styled(DialogContent)`
  padding-bottom: 20px;
`;

const StyledDialogButtons = styled(DialogActions)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 12px;
  padding-bottom: 20px;
  padding-right: 24px;
`;

export const StyledDialogTitle = styled(DialogTitle)`
  display: flex;
  flex-direction: row;
  padding: 8px 12px 8px 24px;
  justify-content: space-between;
  align-items: center;
`;

const CustomCloseIconButton = styled(IconButton)`
  width: 40px;
  height: 40px;
  border-radius: 8px;
`;

// Props definition
interface StyledDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
  confirmButtonText: string;
  cancelButtonText?: string;
  disableConfirm?: boolean;
  confirmButtonId?: string;
}

const StyledDialog: React.FC<StyledDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  content,
  confirmButtonText,
  cancelButtonText = 'Cancel',
  disableConfirm = false,
  confirmButtonId,
}) => (
  <Dialog maxWidth="xs" onClose={onClose} open={open}>
    <ContentContainer>
      <StyledDialogTitle>
        <StyledDialogTitleFont>{title}</StyledDialogTitleFont>
        <CustomCloseIconButton onClick={onClose}>
          <CloseIcon />
        </CustomCloseIconButton>
      </StyledDialogTitle>
      <StyledDialogContent>{content}</StyledDialogContent>
    </ContentContainer>
    <StyledDialogButtons>
      <Button onClick={onClose} variant="outlined">
        {cancelButtonText}
      </Button>
      <Button id={confirmButtonId} onClick={onConfirm} variant="contained" disabled={disableConfirm}>
        {confirmButtonText}
      </Button>
    </StyledDialogButtons>
  </Dialog>
);

export default StyledDialog;
