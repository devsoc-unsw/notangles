import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useContext } from 'react';

import { AppContext } from '../../context/AppContext';

interface CollapseButtonProps {
  onClick: () => void;
  toolTipTitle: string;
}

const StyledCollapseButton = styled(IconButton)`
  border-radius: 8px;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const StyledExpandMoreIcon = styled(ExpandMoreIcon, { shouldForwardProp: (prop) => prop !== 'collapsed' })<{
  collapsed: boolean;
}>`
  transform: ${({ collapsed }) => (collapsed ? 'rotate(270deg)' : 'rotate(90deg)')};
`;

const CollapseButton: React.FC<CollapseButtonProps> = ({ onClick, toolTipTitle }) => {
  const { sidebarCollapsed } = useContext(AppContext);
  return (
    <>
      <Tooltip title={toolTipTitle} placement="right">
        <StyledCollapseButton onClick={onClick}>
          <StyledExpandMoreIcon collapsed={sidebarCollapsed} />
        </StyledCollapseButton>
      </Tooltip>
    </>
  );
};

export default CollapseButton;
