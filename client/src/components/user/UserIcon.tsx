import { Tooltip } from '@mui/material';
import React from 'react';

const emptyProfile = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
const defaultSize = 34;

interface UserIconProps {
  url?: string;
  size?: number;
  tooltipTitle?: string;
}

const UserIcon: React.FC<UserIconProps> = ({ url, size, tooltipTitle }) => {
  console.log('rayy', url);
  return (
    <Tooltip title={tooltipTitle} placement="bottom">
      <img
        src={url || emptyProfile}
        width={size || defaultSize}
        height={size || defaultSize}
        style={{ borderRadius: 999, backgroundColor: 'white' }}
      />
    </Tooltip>
  );
};

export default UserIcon;
