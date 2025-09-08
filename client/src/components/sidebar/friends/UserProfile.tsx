import styled from '@emotion/styled';
import React from 'react';

export const emptyProfile = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const StyledContainer = styled('div')`
  display: flex;
  gap: 14px;
  align-items: center;
`;

const StyledFullname = styled('div')`
  word-break: break-all;
`;

const UserProfile: React.FC<{ firstName: string; lastName: string; profileURL?: string }> = ({
  firstName,
  lastName,
  profileURL,
}) => {
  const getFullName = () => {
    let fullname = firstName + ' ' + lastName;
    if (fullname.length >= 32) {
      fullname = fullname.slice(0, 32);
      return fullname + '...';
    }
    return fullname;
  };

  return (
    <StyledContainer>
      <img
        src={profileURL ?? emptyProfile}
        width={34}
        height={34}
        style={{ borderRadius: 999, backgroundColor: 'white' }}
      />
      <div>
        <StyledFullname>{getFullName()}</StyledFullname>
      </div>
    </StyledContainer>
  );
};

export default UserProfile;
