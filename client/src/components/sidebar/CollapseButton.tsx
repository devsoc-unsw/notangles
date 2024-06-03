import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import { BarsArrowDownIcon } from '@heroicons/react/24/solid';

const StyledCollapseButton = styled(IconButton)`
  border-radius: 8px;
  color: ${({ theme }) => theme.palette.text.primary};
`;

interface CollapseButtonProps {
  collapsed: boolean;
  onClick: () => void;
  toolTipTitle: string;
}

const CollapseButton: React.FC<CollapseButtonProps> = ({ collapsed, onClick, toolTipTitle }) => {
  return (
    <>
      <Tooltip title={collapsed ? toolTipTitle : ''} placement="right">
        <StyledCollapseButton onClick={onClick}>
          <BarsArrowDownIcon
            width={28}
            height={28}
            style={{ transform: collapsed ? 'rotate(270deg)' : 'rotate(90deg)' }}
            color="inherit"
          />
        </StyledCollapseButton>
      </Tooltip>
    </>
  );
};

export default CollapseButton;
