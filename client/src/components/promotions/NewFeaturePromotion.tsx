import { Button, Divider, Fade, Grid, List, ListItem, Modal, Typography } from '@mui/material';
import { Box, styled } from '@mui/system';
import { NewFeaturePromotionProps } from '../../interfaces/PropTypes';
import { useMemo, useState } from 'react';
import storage from '../../utils/storage';

const StyledModal = styled(Modal)`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const StyledModalBody = styled(Box)`
  background-color: ${({ theme }) => theme.palette.background.default};
  width: 70%;
  border-radius: 20px;
`;

const NewLabel = styled(Box)`
  display: inline;
  background-color: ${({ theme }) => theme.palette.primary.main};
  border: none;
  padding: 5px;
  border-radius: 10px;
  color: white;
`;

const StyledTextWrapper = styled(Box)`
  margin: 40px;
`;

const StyledMediaGridWrapper = styled(Grid)`
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const StyledMedia = styled('img')`
  height: 100%;
  object-fit: cover;
  object-position: top left;
  border-radius: 0 20px 20px 0;
`;

const NEW_FEATURE_PROMOTION_KEY = 'newfeatpromo';
const NewFeaturePromotion = ({ imgSrc, title, subTitle, bullets }: NewFeaturePromotionProps) => {
  const [seenPromo, setSeenPromo] = useState<boolean>(storage.get(NEW_FEATURE_PROMOTION_KEY) || false);

  const handlePromoDismiss = () => {
    setSeenPromo(true);
    storage.set(NEW_FEATURE_PROMOTION_KEY, true);
  };

  const bulletPoints = useMemo(
    () =>
      bullets.map(({ main, description }) => {
        return (
          <>
            <Typography variant="subtitle1" component="p">
              <b>{main}</b>
            </Typography>
            {description && (
              <List sx={{ listStyleType: 'disc', pl: 4, pt: 0, pb: 0 }}>
                <ListItem sx={{ display: 'list-item' }}>{description}</ListItem>
              </List>
            )}
          </>
        );
      }),
    [bullets],
  );

  return (
    <StyledModal open={!seenPromo} onClose={handlePromoDismiss} disableAutoFocus>
      <Fade in={!seenPromo}>
        <StyledModalBody>
          <Grid container spacing={2}>
            <Grid item xs={6} container>
              {/* Text and stuff */}
              <StyledTextWrapper>
                <NewLabel>New</NewLabel>
                <Typography variant="h4" component="h4" sx={{ margin: '20px 0 10px 0' }}>
                  {title}
                </Typography>
                <Divider orientation="horizontal" />
                <Typography variant="h6" component="h6" sx={{ margin: '15px 0' }}>
                  {subTitle}
                </Typography>
                {bulletPoints}
                <Button
                  variant="contained"
                  disableElevation
                  size="large"
                  onClick={handlePromoDismiss}
                  sx={{ marginTop: '20px' }}
                >
                  Continue
                </Button>
              </StyledTextWrapper>
            </Grid>
            <StyledMediaGridWrapper item xs={6}>
              <StyledMedia src={imgSrc} />
            </StyledMediaGridWrapper>
          </Grid>
        </StyledModalBody>
      </Fade>
    </StyledModal>
  );
};

export default NewFeaturePromotion;
