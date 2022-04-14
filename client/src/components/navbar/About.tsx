import React from 'react';
import { Link, Typography } from '@mui/material';
import { styled } from '@mui/system';

import useGif from '../../assets/how_to_use.gif';

const HowToUseImg = styled('img')`
  display: block;
  margin: 10px auto 10px;
  width: 100%;
  border-radius: 2%;
`;

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
        Notangles is an app for UNSW students to build their perfect timetable, even before class registration opens. We have many
        features on the way, including auto-timetabling, and syncing your timetable with friends.
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
        , it was created by&nbsp;
        <Link href="https://www.csesoc.unsw.edu.au/teams/software-projects/" target="_blank">
          CSESoc Projects
        </Link>
        &nbsp;– a place for student-led projects where you can learn something new, and make some friends along the way. Notangles
        is free and <Link href="https://github.com/csesoc/notangles">open-source</Link>.
      </Typography>
      <StyledTypography variant="h6">How it works</StyledTypography>
      <Typography gutterBottom variant="body2">
        Select your courses, then drag-and-drop classes to customise your timetable. You can drag clutter (like lectures which you
        aren’t going to watch live) to the unscheduled column.
      </Typography>
      <HowToUseImg src={useGif} alt="how to use gif" />
      <Typography gutterBottom variant="body2">
        Note: Notangles does not enroll in your classes. It’s a tool for planning your timetable, but you’ll still need to
        officially enroll at&nbsp;
        <Link href="https://my.unsw.edu.au/" target="_blank">
          myUNSW
        </Link>
        .
      </Typography>
      <StyledTypography variant="h6">Future developments</StyledTypography>
      <FeatList>
        <li> Sync your timetable with friends</li>
      </FeatList>
      <StyledTypography variant="h6">About the team</StyledTypography>
      <Typography gutterBottom variant="body2">
        The current 2022 development team consists of two leads and nine members.
      </Typography>
      <Typography gutterBottom variant="body2">
        <strong>Team Leads:</strong>
      </Typography>
      <FeatList>
        <li>Mun Joon Teo</li>
        <li>Oliver Xu</li>
      </FeatList>
      <Typography gutterBottom variant="body2">
        <strong>Members:</strong>
      </Typography>
      <FeatList>
        <li>Angella Pham</li>
        <li>Emily Tang</li>
        <li>Grace Kan</li>
        <li>Manhua Lu</li>
        <li>Martin Knezevic</li>
        <li>Maxwell Phillips</li>
        <li>Omar Khursheed</li>
        <li>Raiyan Ahmed</li>
        <li>Sijin Soon</li>
      </FeatList>
      <StyledTypography variant="h6">Disclaimer</StyledTypography>
      <Typography gutterBottom variant="body2">
        While we try our best, Notangles is not an official UNSW site, and cannot guarantee data accuracy or reliability.
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
