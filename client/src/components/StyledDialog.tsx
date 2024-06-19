// import React, { useContext, useEffect, useRef, useState } from 'react';
// import {
//   StyledCloseIcon,
//   StyledDialogButtons,
//   StyledDialogContent,
//   StyledDialogTitle,
//   StyledDialogTitleFont,
//   StyledTitleContainer,
// } from '../styles/ControlStyles';
// import { Button, Dialog } from '@mui/material';

// interface StyledDialogProps {
//   closeDialogCommand: () => void;
//   dialogUse: boolean;
//   followingFunction: () => void;
//   functionTitle: string;
// }

// const StyledDialog: React.FC<StyledDialogProps> = ({
//   closeDialogCommand,
//   dialogUse,
//   followingFunction,
//   functionTitle,
// }) => {
//   return (
//     <>
//       <Dialog maxWidth="xs" onClose={closeDialogCommand} open={logoutDialog}>
//         <StyledTitleContainer>
//           <StyledDialogTitle>
//             <StyledDialogTitleFont>Confirm Log out</StyledDialogTitleFont>
//             <StyledCloseIcon
//               onClick={() => {
//                 closeDialogCommand
//               }}
//             />
//           </StyledDialogTitle>
//           <StyledDialogContent>Are you sure you want to log out?</StyledDialogContent>
//         </StyledTitleContainer>
//         <StyledDialogButtons>
//           <Button
//             onClick={() => {
//               setLogoutDialog(false);
//             }}
//             variant="outlined"
//           >
//             Cancel
//           </Button>
//           <Button
//             id="confirm-logout-button"
//             onClick={() => {
//               logoutCall();
//               setLogoutDialog(false);
//             }}
//             variant="contained"
//           >
//             Log out
//           </Button>
//         </StyledDialogButtons>
//       </Dialog>
//     </>
//   );
// };

// export default StyledDialog;
