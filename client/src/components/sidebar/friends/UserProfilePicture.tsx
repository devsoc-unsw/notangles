import React from 'react';

export const emptyProfile = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

type UserProfilePicProps = {
  profileURL?: string;
  size?: number;
  alt?: string;
};

const UserProfilePicture: React.FC<UserProfilePicProps> = ({ profileURL, size = 34, alt }) => {
  return (
    <img
      src={profileURL ?? emptyProfile}
      alt={alt ?? 'profile'}
      style={{
        borderRadius: 999,
        backgroundColor: 'white',
        objectFit: 'cover',
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
};

export default UserProfilePicture;
