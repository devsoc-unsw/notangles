import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EjectIcon from '@mui/icons-material/Eject';

interface CollapseButtonProps {
  collapsed: boolean;
  onClick: () => void;
  toolTipTitle: string;
}

const StyledCollapseButton = styled(IconButton)`
  border-radius: 8px;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const StyledExpandMoreIcon = styled(EjectIcon)<{ collapsed: boolean }>`
  transform: ${({ collapsed }) => (collapsed ? 'rotate(90deg)' : 'rotate(270deg)')};
`;

const CollapseButton: React.FC<CollapseButtonProps> = ({ collapsed, onClick, toolTipTitle }) => {
  return (
    <>
      <Tooltip title={toolTipTitle} placement="right">
        <StyledCollapseButton onClick={onClick}>
          <StyledExpandMoreIcon collapsed={collapsed} />
        </StyledCollapseButton>
      </Tooltip>
    </>
  );
};

export default CollapseButton;
