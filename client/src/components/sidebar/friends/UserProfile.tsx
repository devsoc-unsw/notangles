import styled from '@emotion/styled';
import React, { useContext } from 'react';

import { AppContext } from '../../../context/AppContext';

export const emptyProfile = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const StyledContainer = styled('div')`
  display: flex;
  gap: 14px;
  align-items: center;
  user-select: none;
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

const UserProfile: React.FC<{
  firstName: string;
  lastName: string;
  profileURL?: string;
  overrideCollapse?: boolean;
}> = ({ firstName, lastName, profileURL, overrideCollapse }) => {
  const { sidebarCollapsed } = useContext(AppContext);

  return (
    <StyledContainer>
      <img
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        src={profileURL || emptyProfile}
        style={{ borderRadius: 999, backgroundColor: 'white', objectFit: 'cover', width: '34px', height: '34px' }}
      />
      {(!sidebarCollapsed || overrideCollapse) && (
        <div>
          <StyledFullname>{getFullName(firstName, lastName)}</StyledFullname>
        </div>
      )}
    </StyledContainer>
  );
};

export default UserProfile;
