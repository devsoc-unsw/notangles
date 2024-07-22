import { Close as CloseIcon } from '@mui/icons-material';
import { DialogTitle, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/system';

const StyledDialogTitle = styled(DialogTitle)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

interface AddGroupDialogTitleProps {
  isEditing: boolean;
  handleClose: () => void;
}

const AddGroupDialogTitle: React.FC<AddGroupDialogTitleProps> = ({ isEditing, handleClose }) => {
  return (
    <>
      <StyledDialogTitle>
        <Typography variant="h6">{isEditing ? 'Edit Group Details' : 'Create a Group'}</Typography>
        <div>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </StyledDialogTitle>
    </>
  );
};

export default AddGroupDialogTitle;
