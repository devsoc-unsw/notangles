import React from 'react';

export const emptyProfile = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

interface UserProfilePicProps {
  profilePictureUrl?: string;
  size?: number;
  alt?: string;
}

const UserProfilePicture: React.FC<UserProfilePicProps> = ({ profilePictureUrl, size = 34, alt }) => {
  return (
    <img
      src={profilePictureUrl ?? emptyProfile}
      alt={alt ?? 'profile'}
      style={{
        borderRadius: 999,
        backgroundColor: 'white',
        objectFit: 'cover',
        width: `${size.toString()}px`,
        height: `${size.toString()}px`,
      }}
    />
  );
};

export default UserProfilePicture;
