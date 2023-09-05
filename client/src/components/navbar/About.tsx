import { Link, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

const StyledTypography = styled(Typography)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const FeatList = styled('ul')`
  margin-top: 4px;
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 20px;
`;

const About: React.FC = () => {
  return (
    <>
      <Typography gutterBottom variant="body2">
        Notangles is an app for UNSW students to build their perfect timetable, even before class registration opens. We
        have many features on the way, including support for your own custom events, and syncing your timetable with
        friends.
      </Typography>
      <Typography gutterBottom variant="body2">
        Inspired by&nbsp;
        <Link href="https://tdransfield.net/projects/bojangles/" target="_blank">
          Bojangles
        </Link>
        &nbsp;and&nbsp;
        <Link href="https://crossangles.app/" target="_blank">
          Crossangles
        </Link>
        , it was created by CSESoc Projects – a place for student-led projects where you can learn something new, and
        make some friends along the way. Notangles is free and{' '}
        <Link href="https://github.com/csesoc/notangles">open-source</Link>.
      </Typography>
      <StyledTypography variant="h6">Future developments</StyledTypography>
      <FeatList>
        <li> Sync your timetable with friends</li>
      </FeatList>
      <StyledTypography variant="h6">About the team</StyledTypography>
      <Typography gutterBottom variant="body2">
        The current 2023 development team consists of two directors and seven members.
      </Typography>
      <Typography gutterBottom variant="body2">
        <strong>Team Directors:</strong>
      </Typography>
      <FeatList>
        <li>Manhua Lu</li>
        <li>Raiyan Ahmed</li>
      </FeatList>
      <Typography gutterBottom variant="body2">
        <strong>Members:</strong>
      </Typography>
      <FeatList>
        <li>Eklavya Joshi</li>
        <li>Jasmine Tran</li>
        <li>Michael Siu</li>
        <li>Sally Sun</li>
        <li>Shaam Jevan</li>
        <li>Sijin Soon</li>
        <li>Wanning Cai</li>
      </FeatList>
      <StyledTypography variant="h6">Disclaimer</StyledTypography>
      <Typography gutterBottom variant="body2">
        While we try our best, Notangles is not an official UNSW site, and cannot guarantee data accuracy or
        reliability.
      </Typography>
      <Typography gutterBottom variant="body2">
        If you find an issue or have a suggestion, please{' '}
        <Link href="https://forms.gle/rV3QCwjsEbLNyESE6" target="_blank">
          let us know
        </Link>
        .
      </Typography>
    </>
  );
};

export default About;
