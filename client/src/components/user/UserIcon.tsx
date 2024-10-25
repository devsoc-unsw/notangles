import styled from '@emotion/styled';
import { Tooltip } from '@mui/material';
import React from 'react';

const emptyProfile = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
const defaultSize = 38;

interface UserIconProps {
  url?: string;
  size?: number;
  tooltipTitle?: string;
}

const StyledUserImage = styled('img')`
  border-radius: 999px;
  background-color: white;
  border: 1px grey solid;
`;

const UserIcon: React.FC<UserIconProps> = ({ url, size, tooltipTitle }) => {
  return (
    <Tooltip title={tooltipTitle} placement="bottom">
      <StyledUserImage src={url || emptyProfile} width={size || defaultSize} height={size || defaultSize} />
    </Tooltip>
  );
};

export default UserIcon;