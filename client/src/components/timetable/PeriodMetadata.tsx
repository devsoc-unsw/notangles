import React, { useContext } from 'react';
import { LocationOn, PeopleAlt, Warning } from '@mui/icons-material';
import { yellow } from '@mui/material/colors';
import { styled } from '@mui/system';
import { unknownErrorMessage } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { ClassData, Status } from '../../interfaces/Periods';
import { PeriodMetadataProps } from '../../interfaces/PropTypes';
import { getClassDataFromPeriod } from '../../utils/getClassCourse';

const StyledLocationIcon = styled(LocationOn)`
  vertical-align: top;
  font-size: inherit;
`;

const StyledPeopleIcon = styled(PeopleAlt)`
  vertical-align: top;
  font-size: inherit;
  margin-right: 0.2rem;
`;

const StyledWarningIcon = styled(Warning)`
  vertical-align: top;
  font-size: inherit;
  margin-right: 0.2rem;
  color: ${yellow[400]};
`;

const StyledCapacityIndicator = styled('span', {
  shouldForwardProp: (prop) => prop !== 'classStatus',
})<{
  classStatus: string;
}>`
  text-overflow: ellipsis;
  margin: 0;
  font-weight: ${({ classStatus }) => (classStatus !== 'Open' ? 'bolder' : undefined)};
`;

const PeriodMetadata: React.FC<PeriodMetadataProps> = ({ period }) => {
  const { setAlertMsg, setErrorVisibility } = useContext(AppContext);
  const { selectedCourses } = useContext(CourseContext);

  let currClass: ClassData | null = null;
  let classStatus: Status | null = null;

  try {
    currClass = getClassDataFromPeriod(selectedCourses, period);
    classStatus = currClass.status;
  } catch (err) {
    setAlertMsg(unknownErrorMessage);
    setErrorVisibility(true);
  }

  if (!currClass || !classStatus) return <></>;

  const currLocation = period.locations[0];
  const possibleLocations = period.locations.length;

  return (
    <>
      <StyledCapacityIndicator classStatus={classStatus}>
        {classStatus !== 'Open' ? <StyledWarningIcon /> : <StyledPeopleIcon />}
        {classStatus === 'On Hold' ? 'On Hold ' : `${currClass.enrolments}/${currClass.capacity} `}
      </StyledCapacityIndicator>
      ({period.time.weeks.length > 0 ? 'Weeks' : 'Week'} {period.time.weeksString})<br />
      {currLocation ? (
        <>
          <StyledLocationIcon />
          {currLocation + (possibleLocations > 1 ? ` + ${possibleLocations - 1}` : '')}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default PeriodMetadata;
