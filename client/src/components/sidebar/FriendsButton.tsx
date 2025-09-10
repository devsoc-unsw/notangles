import { ArrowDropDown, ArrowDropUp, Person } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import { useContext, useMemo } from 'react';

import { AppContext } from '../../context/AppContext';

interface FriendsButtonProps {
  friendsListOpen: boolean;
  handleFriendsListToggle: () => void;
}

const StyledFriendsButton = styled(IconButton, { shouldForwardProp: (prop) => prop !== 'isSelected' })<{
  isSelected: boolean;
}>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 8px;
  padding: 12px;
  background-color: ${({ isSelected }) => (isSelected ? 'rgb(157, 157, 157, 0.15)' : 'transparent')};
`;

const StyledFriendsContainer = styled(Box)`
  display: flex;
  justify-content: flex-start;
  gap: 16px;
`;

const IndividualComponentTypography = styled(Typography)`
  font-size: 16px;
`;

// TODO: Repurpose using Sunny's design for friends
const FriendsButton = ({ friendsListOpen, handleFriendsListToggle }: FriendsButtonProps) => {
  const { sidebarCollapsed } = useContext(AppContext);
  const friendToggleArrow = useMemo(() => {
    if (sidebarCollapsed) return null;
    return friendsListOpen ? <ArrowDropUp /> : <ArrowDropDown />;
  }, [sidebarCollapsed, friendsListOpen]);

  return (
    <>
      <Tooltip title="Friends" placement="right">
        <StyledFriendsButton color="inherit" isSelected={false} onClick={handleFriendsListToggle}>
          <StyledFriendsContainer>
            <Person />
            <IndividualComponentTypography>{sidebarCollapsed ? '' : 'Friends'}</IndividualComponentTypography>
          </StyledFriendsContainer>
          {friendToggleArrow}
        </StyledFriendsButton>
      </Tooltip>
    </>
  );
};

export default FriendsButton;
