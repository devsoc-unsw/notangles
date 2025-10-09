import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

interface CollapseButtonProps {
  sidebarCollapsed: boolean;
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

const CollapseButton: React.FC<CollapseButtonProps> = ({ sidebarCollapsed, onClick, toolTipTitle }) => {
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
