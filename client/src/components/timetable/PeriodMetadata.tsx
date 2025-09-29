import { LocationOn, PeopleAlt, Warning } from '@mui/icons-material';
import { yellow } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import React from 'react';

import { PeriodMetadataProps } from '../../interfaces/PropTypes';

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

const PeriodMetadata: React.FC<PeriodMetadataProps> = ({ period, classData }) => {
  const currLocation = period.locations[0];
  const possibleLocations = period.locations.length;

  return (
    <>
      <StyledCapacityIndicator classStatus={classData.status}>
        {classData.status !== 'Open' ? <StyledWarningIcon /> : <StyledPeopleIcon />}
        {classData.status === 'On Hold' ? 'On Hold ' : `${String(classData.enrolments)}/${String(classData.capacity)} `}
      </StyledCapacityIndicator>
      ({period.time.weeks.length > 0 ? 'Weeks' : 'Week'} {period.time.weeksString})<br />
      {currLocation ? (
        <>
          <StyledLocationIcon />
          {currLocation + (possibleLocations > 1 ? ` + ${String(possibleLocations - 1)}` : '')}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default PeriodMetadata;
