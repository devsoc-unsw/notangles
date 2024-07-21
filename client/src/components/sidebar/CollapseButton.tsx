import { ViewSidebarRounded } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/system';

interface CollapseButtonProps {
  collapsed: boolean;
  onClick: () => void;
  toolTipTitle: string;
}

const StyledIconButton = styled(IconButton)`
  display: flex;
  gap: 16px;
  border-radius: 8px;
  justify-content: flex-start;
  padding: 12px;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const CollapseButton: React.FC<CollapseButtonProps> = ({ collapsed, onClick, toolTipTitle }) => {
  return (
    <>
      <Tooltip title={toolTipTitle} placement="right">
        <StyledIconButton onClick={onClick}>
          <ViewSidebarRounded color="inherit" />
        </StyledIconButton>
      </Tooltip>
    </>
  );
};

export default CollapseButton;
