import styled from '@emotion/styled';
import React, { useContext } from 'react';

import { AppContext } from '../../../context/AppContext';

export const emptyProfile = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const StyledContainer = styled('div')`
  display: flex;
  gap: 14px;
  align-items: center;
`;

const StyledFullname = styled('div')`
  word-break: break-all;
  font-size: 0.9rem;
`;

const getFullName = (firstName: string, lastName: string) => {
  let fullname = firstName + ' ' + lastName;
  if (fullname.length >= 32) {
    fullname = fullname.slice(0, 32);
    return fullname + '...';
  }
  return fullname;
};

const UserProfile: React.FC<{ firstName: string; lastName: string; profileURL?: string }> = ({
  firstName,
  lastName,
  profileURL,
}) => {
  const { sidebarCollapsed } = useContext(AppContext);

  return (
    <StyledContainer>
      <img
        src={profileURL ?? emptyProfile}
        width={34}
        height={34}
        style={{ borderRadius: 999, backgroundColor: 'white' }}
      />
      {!sidebarCollapsed && (
        <div>
          <StyledFullname>{getFullName(firstName, lastName)}</StyledFullname>
        </div>
      )}
    </StyledContainer>
  );
};

export default UserProfile;
