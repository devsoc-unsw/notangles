import { Description, Info, Security, Settings as SettingsIcon } from '@mui/icons-material';
import { AppBar, Toolbar, Typography, useMediaQuery, useTheme, FormControl, MenuItem, Select, InputLabel } from '@mui/material';
import { createDefaultTimetable } from '../../utils/timetableHelpers';
import { styled } from '@mui/system';
import React, { useContext, useState } from 'react';

import notanglesLogoGif from '../../assets/notangles.gif';
import notanglesLogo from '../../assets/notangles_1.png';
import { ThemeType } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import About from './About';
import Changelog from './Changelog';
import CustomModal from './CustomModal';
import Privacy from './Privacy';
import Settings from './Settings';

const LogoImg = styled('img')`
  height: 46px;
  margin-right: 12.5px;
  margin-top: -2px;
  margin-left: -11.5px;
`;

const NavbarBox = styled('div')`
  flex-grow: 1;
  position: fixed;
  margin-left: 0px;
  z-index: 1201; /* overriding https://material-ui.com/customization/z-index/ */
`;

const StyledNavBar = styled(AppBar)`
  background: ${({ theme }) => theme.palette.primary.main};
  z-index: 1201;
`;

const NavbarTitle = styled(Typography)`
  flex-grow: 1;
  z-index: 1201;
`;

const Weak = styled('span')`
  font-weight: 300;
  opacity: 0.8;
  margin-left: 15px;
  font-size: 90%;
  vertical-align: middle;
  position: relative;
  bottom: 1px;
  z-index: 1201;
`;

const Navbar: React.FC = () => {
  const [currLogo, setCurrLogo] = useState(notanglesLogo);

  const {
    term,
    termName,
    setTermName,
    year,
    setTerm,
    setYear,
    selectedTimetable,
    setSelectedTimetable,
    displayTimetables,
    setDisplayTimetables,
    termsData
  } = useContext(AppContext);

  const { setSelectedCourses, setSelectedClasses, setCreatedEvents } =
    useContext(CourseContext);

  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const selectTerm = (e: any) => {
    // // TODO: need to handle selecting that corresponding term n reloading term data/resetting timetable?
    let newTermName = e.target.value.split(', ')[0]
    let termNum = 'T' + newTermName.split(' ')[1]
    let newYear = e.target.value.split(', ')[1]
    // // TODO:fix this so that we switch the termId for the current tab
    // // TODO:implement error message to ask user if they want to reset the current timetable (if it has any data) b4 switching terms
    // NEW IDEA: TODO: use arrow buttons to switch between terms - we shld keep independent timetables for each term and change/restore these when we switch between the terms

    setTerm(termNum)
    setYear(newYear)
    setTermName(newTermName)
    const defaultStartTimetable = 0;
    setSelectedTimetable(defaultStartTimetable);
    setSelectedClasses(displayTimetables[termNum][defaultStartTimetable].selectedClasses);
    setCreatedEvents(displayTimetables[termNum][defaultStartTimetable].createdEvents);
    setSelectedCourses(displayTimetables[termNum][defaultStartTimetable].selectedCourses);
  }

  let termData = new Set([termsData.prevTerm.termName.concat(', ', termsData.prevTerm.year), termsData.newTerm.termName.concat(', ', termsData.newTerm.year)]);
  return (
    <NavbarBox>
      <StyledNavBar enableColorOnDark position="fixed">
        <Toolbar>
          <LogoImg
            src={currLogo}
            alt="Notangles logo"
            onMouseOver={() => setCurrLogo(notanglesLogoGif)}
            onMouseOut={() => setCurrLogo(notanglesLogo)}
          />
          <NavbarTitle variant="h6">
            Notangles
            {/* <Weak>{isMobile ? term : termName.concat(', ', year)}</Weak> */}
          </NavbarTitle>
          <FormControl>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={isMobile ? term : termName.concat(', ', year)}
              label="terms"
              onChange={selectTerm}
            >
              {
                Array.from(termData).map((term, index) => {
                  return <MenuItem key={index} value={term}>{term}</MenuItem>;
                })
              }
            </Select>
          </FormControl>
          <CustomModal
            title="About"
            showIcon={<Info />}
            description={'Notangles: no more timetable tangles'}
            content={<About />}
          />
          <CustomModal title="Changelog" showIcon={<Description />} description={'Changelog'} content={<Changelog />} />
          <CustomModal
            title="Privacy"
            showIcon={<Security />}
            description={'Application Privacy Statement'}
            content={<Privacy />}
          />
          <CustomModal title="Settings" showIcon={<SettingsIcon />} description={'Settings'} content={<Settings />} />
        </Toolbar>
      </StyledNavBar>
    </NavbarBox>
  );
};

export default Navbar;
