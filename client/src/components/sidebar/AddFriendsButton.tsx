import React from 'react';
import { Box } from '@mui/material';
import CustomModal from './CustomModal';
import AddFriends from './AddFriends';
import ControlPointIcon from '@mui/icons-material/ControlPoint';

// const AddFriendsButton = () => {
//   return (
//     <div>
//       <Button variant="outlined" disableElevation color="secondary" style={{ borderRadius: 50 }}>
//         <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', paddingLeft: '2em' }}>
//           Add Friends
//           <CustomModal
//             title="Add Friends"
//             showIcon={<ControlPointIcon />}
//             description={'Add/Invite Friends'}
//             content={<AddFriends />}
//           />
//         </div>
//       </Button>
//     </div>
//   );
// };

const AddFriendsButton = () => {
  return (
    <CustomModal
      title="Add Friends"
      showIcon={
        <Box style={{ borderRadius: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', paddingLeft: '2em' }}>Add Friends</div>
          <ControlPointIcon />
        </Box>
      }
      description={'Add/Invite Friends'}
      content={<AddFriends />}
    />
  );
};

export default AddFriendsButton;
