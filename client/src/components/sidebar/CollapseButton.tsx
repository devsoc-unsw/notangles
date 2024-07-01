import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/system';

interface CollapseButtonProps {
  collapsed: boolean;
  onClick: () => void;
  toolTipTitle: string;
}

const StyledCollapseButton = styled(IconButton)`
  border-radius: 8px;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const StyledExpandMoreIcon = styled(ExpandMoreIcon)<{ collapsed: boolean }>`
  transform: ${({ collapsed }) => (collapsed ? 'rotate(270deg)' : 'rotate(90deg)')};
`;

const CollapseButton: React.FC<CollapseButtonProps> = ({ collapsed, onClick, toolTipTitle }) => {
  return (
    <>
      <Tooltip title={toolTipTitle} placement="right">
        <StyledCollapseButton onClick={onClick}>
          <StyledExpandMoreIcon collapsed={collapsed} color="inherit" />
        </StyledCollapseButton>
      </Tooltip>
    </>
  );
};

export default CollapseButton;
