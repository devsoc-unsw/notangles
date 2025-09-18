import { AddCircle } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useContext, useState } from 'react';

import { AppContext } from '../../context/AppContext';
import AddFriendsMenu from './AddFriendsMenu';
import CustomModal from './CustomModel';

const StyledAddButton = styled(IconButton)`
  display: flex;
  flex-direction: row;
  gap: 16px;
  border-radius: 8px;
  justify-content: space-around;
  padding: 8px;
  color: ${({ theme }) => theme.palette.text.primary};
  border: 1px solid;
  border-color: ${({ theme }) => theme.palette.primary.main};
`;

const StyledAddIcon = styled(AddCircle)`
  color: ${({ theme }) => theme.palette.primary.main};
`;

interface AddFriendsButtonProps {
  friendsListOpen: boolean;
}

const AddFriendsButton = ({ friendsListOpen }: AddFriendsButtonProps) => {
  const { sidebarCollapsed } = useContext(AppContext);
  const [modalOpen, setModalOpen] = useState(false);

  if (!friendsListOpen) return null;

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  return (
    <>
      <StyledAddButton onClick={toggleModal}>
        {!sidebarCollapsed && <Typography fontSize={15}>Add Friends</Typography>}
        <Tooltip title="Add Friends" placement="right">
          <StyledAddIcon />
        </Tooltip>
      </StyledAddButton>
      <CustomModal
        description="Add Friends"
        content={<AddFriendsMenu />}
        isOpen={modalOpen}
        toggleIsOpen={toggleModal}
      />
    </>
  );
};

export default AddFriendsButton;
