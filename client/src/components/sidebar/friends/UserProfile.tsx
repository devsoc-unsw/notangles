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
  font-size: 0.9rem;
  white-space: nowrap;
`;

const getTextWidth = (text: string, font: string): number => {
  let canvas = document.createElement('canvas');

  const context = canvas.getContext('2d');
  if (!context) {
    return 0;
  }
  
  context.font = font;
  const metrics = context.measureText(text);
  canvas.remove();

  return metrics.width;
};

const getFullName = (firstName: string, lastName: string) => {
  const font = '400 14.4px Roboto, Helvetica, Arial, sans-serif';
  const maxWidth = 100;

  let fullname = firstName + ' ' + lastName;

  if (getTextWidth(fullname, font) > maxWidth) {
    fullname = firstName + ' ' + lastName[0] + '.';
    let i = 2;
    while (getTextWidth(fullname, font) > maxWidth) {
      fullname = firstName.slice(0, -i) + '. ' + lastName[0] + '.';
      i++;
    }
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
