import { Edit as EditIcon } from '@mui/icons-material';
import { IconButton, Popover, TextField } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';


const EditIconCircle = styled('div')`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid gray;
  border-radius: 999px;
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  top: -35px;
  cursor: pointer;
  &:hover {
    border: ${({ theme }) => (theme.palette.mode === 'light' ? '1px solid black' : '1px solid white;')};
  }
`;

interface EditImagePopOverProps {
  groupImageURL: string;
  setGroupImageURL: (url: string) => void;
}

const EditImagePopOver: React.FC<EditImagePopOverProps> = ({ groupImageURL, setGroupImageURL }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  return (
    <EditIconCircle>
      <div>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <EditIcon />
        </IconButton>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <div style={{ width: 400 }}>
            <TextField
              placeholder="Enter image address..."
              variant="outlined"
              value={groupImageURL}
              fullWidth
              onChange={(e) => setGroupImageURL(e.target.value)}
            />
          </div>
        </Popover>
      </div>
    </EditIconCircle>
  );
};

export default EditImagePopOver;
