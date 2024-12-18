import { SwitchAccount } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React, { useContext } from 'react';

import { UserContext } from '../../context/UserContext';

interface FriendsButtonProps {
  collapsed: boolean;
}

const StyledFriendsButton = styled(IconButton)<{ isSelected: boolean }>`
  display: flex;
  border-radius: 8px;
  gap: 16px;
  justify-content: flex-start;
  padding: 12px 12px 12px 12px;
  background-color: ${({ isSelected }) => (isSelected ? 'rgb(157, 157, 157, 0.15)' : 'transparent')};
`;

const IndividualComponentTypography = styled(Typography)<{ collapsed: boolean }>`
  font-size: 16px;
`;

const FriendsButton: React.FC<FriendsButtonProps> = ({ collapsed }) => {
  const { groupsSidebarCollapsed, setGroupsSidebarCollapsed } = useContext(UserContext);

  return (
    <>
      <Tooltip title="Coming Soon: Shared Timetables" placement="right">
        <StyledFriendsButton
          color="inherit"
          // onClick={() => setGroupsSidebarCollapsed(!groupsSidebarCollapsed)}       UNCOMMENT to see shared timetables
          isSelected={!groupsSidebarCollapsed}
        >
          <SwitchAccount />
          <IndividualComponentTypography collapsed={collapsed}>
            {collapsed ? '' : 'Shared Timetables'}
          </IndividualComponentTypography>
        </StyledFriendsButton>
      </Tooltip>
    </>
  );
};

export default FriendsButton;
