import { Close } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReactNode, useContext, useState } from 'react';

import { AppContext } from '../../context/AppContext';

interface CustomModalProps {
  title: string;
  toolTipTitle: string;
  showIcon: ReactNode;
  description: string;
  content: ReactNode;
  isClickable: boolean;
  isSelected?: boolean;
}

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

const ShowModalButton = styled(IconButton, { shouldForwardProp: (prop) => prop !== 'isSelected' })<{
  isSelected: boolean;
}>`
  display: flex;
  flex-direction: row;
  gap: 16px;
  border-radius: 8px;
  justify-content: flex-start;
  padding: 12px 12px 12px 12px;
  background-color: ${({ isSelected }) => (isSelected ? 'rgb(157, 157, 157, 0.15)' : 'transparent')};
`;

const StyledDialogContent = styled(DialogContent)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 20px;
`;

const IndividualComponentTypography = styled(Typography)`
  margin: 0px;
  fontsize: 16px;
`;

const CustomModal: React.FC<CustomModalProps> = ({
  title,
  toolTipTitle,
  showIcon,
  description,
  content,
  isClickable,
  isSelected = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { sidebarCollapsed } = useContext(AppContext);

  const toggleIsOpen = () => {
    if (isClickable) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      <Tooltip title={sidebarCollapsed || !isClickable ? toolTipTitle : ''} placement="right">
        <ShowModalButton color="inherit" onClick={toggleIsOpen} isSelected={isSelected}>
          {showIcon}
          <IndividualComponentTypography>{sidebarCollapsed ? '' : title}</IndividualComponentTypography>
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
    </>
  );
};

export default CustomModal;
