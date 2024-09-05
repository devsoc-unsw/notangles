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

const StyledEmail = styled('div')`
  color: #949494;
  word-break: break-all;
`;

const UserProfile: React.FC<{ firstname: string; lastname: string; email: string; profileURL: string }> = ({
  firstname,
  lastname,
  email,
  profileURL,
}) => {
  const getFullName = () => {
    let fullname = firstname + ' ' + lastname;
    if (fullname.length >= 32) {
      fullname = fullname.slice(0, 32);
      return fullname + '...';
    }
    return fullname;
  };

  const getEmail = () => {
    if (email.length >= 15) {
      email = email.slice(0, 15);
      return email + '...';
    }
    return email;
  };
  return (
    <StyledContainer>
      <img
        src={profileURL || emptyProfile}
        width={34}
        height={34}
        style={{ borderRadius: 999, backgroundColor: 'white' }}
      />
      <div>
        <StyledFullname>{getFullName()}</StyledFullname>
        <StyledEmail>{getEmail()}</StyledEmail>
      </div>
    </StyledContainer>
  );
};

export default UserProfile;
