import { IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReactNode, useContext, useState } from 'react';

import { AppContext } from '../../context/AppContext';
import CustomModal from './CustomModel';

interface CustomModalOpenerProps {
  title: string;
  toolTipTitle: string;
  showIcon: ReactNode;
  description: string;
  content: ReactNode;
  isClickable: boolean;
  isSelected?: boolean;
}

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

const IndividualComponentTypography = styled(Typography)`
  margin: 0px;
  fontsize: 16px;
`;

const CustomModalOpener: React.FC<CustomModalOpenerProps> = ({
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
      <CustomModal description={description} content={content} toggleIsOpen={toggleIsOpen} isOpen={isOpen} />
    </>
  );
};

export default CustomModalOpener;
