import styled from '@emotion/styled';
import React from 'react';

const emptyProfile = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const StyledContainer = styled('div')`
  display: flex;
  gap: 14px;
  align-items: center;
`;

const StyledEmail = styled('div')`
  color: #949494;
`;

const UserProfile: React.FC<{ firstname: string; lastname: string; email: string; profileURL: string }> = ({
  firstname,
  lastname,
  email,
  profileURL,
}) => {
  return (
    <StyledContainer>
      <img
        src={profileURL || emptyProfile}
        width={40}
        height={40}
        style={{ borderRadius: 999, backgroundColor: 'white' }}
      />
      <div>
        <div>
          {firstname} {lastname}
        </div>
        <StyledEmail>{email}</StyledEmail>
      </div>
    </StyledContainer>
  );
};

export default UserProfile;
