import styled from '@emotion/styled';
import React from 'react';

import UserProfilePicture from './UserProfilePicture';

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
  const canvas = document.createElement('canvas');

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

const UserProfile: React.FC<{
  sidebarCollapsed: boolean;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  overrideCollapse?: boolean;
}> = ({ sidebarCollapsed, firstName, lastName, profilePictureUrl, overrideCollapse }) => {
  return (
    <StyledContainer>
      <UserProfilePicture profilePictureUrl={profilePictureUrl} size={34} alt={`${firstName} ${lastName}`} />
      {(!sidebarCollapsed || overrideCollapse) && (
        <div>
          <StyledFullname>{getFullName(firstName, lastName)}</StyledFullname>
        </div>
      )}
    </StyledContainer>
  );
};

export default UserProfile;
