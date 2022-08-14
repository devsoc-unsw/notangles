import React, { useContext } from 'react';
import { LocationOn, PeopleAlt, Warning } from '@mui/icons-material';
import { yellow } from '@mui/material/colors';
import { styled } from '@mui/system';
import { CourseContext } from '../../context/CourseContext';

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
  const { selectedCourses } = useContext(CourseContext);

  const currClass = getClassDataFromPeriod(selectedCourses, period);
  const classStatus = currClass.status;

  return (
    <>
      <StyledCapacityIndicator classStatus={classStatus}>
        {classStatus !== 'Open' ? <StyledWarningIcon /> : <StyledPeopleIcon />}
        {classStatus === 'On Hold' ? 'On Hold ' : `${currClass.enrolments}/${currClass.capacity} `}
      </StyledCapacityIndicator>
      ({period.time.weeks.length > 0 ? 'Weeks' : 'Week'} {period.time.weeksString})<br />
      <StyledLocationIcon />
      {period.locations[0] + (period.locations.length > 1 ? ` + ${period.locations.length - 1}` : '')}
    </>
  );
};

export default PeriodMetadata;
