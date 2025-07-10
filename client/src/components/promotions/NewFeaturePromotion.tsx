import { Button, Divider, Fade, Grid, List, ListItem, Modal, Typography, useTheme } from '@mui/material';
import { Box, styled, useMediaQuery } from '@mui/system';
import { NewFeaturePromotionProps } from '../../interfaces/PropTypes';
import { useMemo, useState } from 'react';
import storage from '../../utils/storage';
import { currentPromoVersion } from '../../constants/timetable';
import { themes, ThemeType } from '../../constants/theme';

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
  const [lastSeenPromoVersion, setLastSeenPromoVersion] = useState<number>(storage.get(NEW_FEATURE_PROMOTION_KEY) || 0);
  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const handlePromoDismiss = () => {
    setLastSeenPromoVersion(currentPromoVersion);
    storage.set(NEW_FEATURE_PROMOTION_KEY, currentPromoVersion);
  };

  const seenCurrentPromo = lastSeenPromoVersion >= currentPromoVersion;

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
    <StyledModal open={!seenCurrentPromo} onClose={handlePromoDismiss} disableAutoFocus>
      <Fade in={!seenCurrentPromo}>
        <StyledModalBody>
          <Grid container spacing={2}>
            <Grid item xs={isMobile ? 12 : 6} container>
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
            {!isMobile && (
              <StyledMediaGridWrapper item xs={6}>
                <StyledMedia src={imgSrc} />
              </StyledMediaGridWrapper>
            )}
          </Grid>
        </StyledModalBody>
      </Fade>
    </StyledModal>
  );
};

export default NewFeaturePromotion;
