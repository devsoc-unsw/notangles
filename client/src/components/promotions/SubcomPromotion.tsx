import { Announcement, Close } from '@mui/icons-material';
import { Alert, Box, IconButton, Link, Slide, Snackbar, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useCallback, useRef, useState } from 'react';

import storage from '../../utils/storage';

const StyledAlertBanner = styled(Alert)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  maxWidth: '30em',
  padding: '18px',
}));

const SUBCOM_PROMOTION_KEY = 'seenSubcom';

const SubcomPromotion = () => {
  const [seenSubcomPromotional, setSeenSubcomPromotional] = useState<boolean>(
    storage.get(SUBCOM_PROMOTION_KEY) || false,
  );
  const activeRecruitment = useRef(new Date().getMonth() === 1); // Subcommittee recruitment peaks in February annually

  const handlePromotionClose = useCallback(() => {
    setSeenSubcomPromotional((prev) => !prev);
    storage.set(SUBCOM_PROMOTION_KEY, true);
  }, []);

  const closingAction = (
    <IconButton size="small" aria-label="close-subcom-promotion-button" color="inherit" onClick={handlePromotionClose}>
      <Close fontSize="small" />
    </IconButton>
  );

  // Not displaying subcom recruitment banner outside of active recruitment times
  if (!activeRecruitment.current) return null;

  return (
    <Box>
      <Snackbar
        open={!seenSubcomPromotional}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ boxShadow: 8 }}
      >
        <Slide in={!seenSubcomPromotional} timeout={500}>
          <StyledAlertBanner severity="info" icon={<Announcement />} action={closingAction}>
            <Typography fontSize={18} marginBottom={1} textAlign={'left'}>
              Subcommittee Recruitment!
            </Typography>
            <Typography fontSize={15} textAlign={'left'}>
              Interested in working on Notangles or one of our other flagship projects? DevSoc is currently recruiting
              members for our 2024 subcommittee!
              <br />
              <br />
              Find out more at <Link href="https://devsoc.app/get-involved">devsoc.app/get-involved</Link>
            </Typography>
          </StyledAlertBanner>
        </Slide>
      </Snackbar>
    </Box>
  );
};

export default SubcomPromotion;
