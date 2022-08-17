import React from 'react';
import { styled } from '@mui/system';
import { Typography } from '@mui/material';
import { 
  Timeline, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineConnector, 
  TimelineContent, 
  TimelineDot, 
  TimelineOppositeContent 
} from '@mui/lab';

type Change = { date: String; changes: String[] };

const changelog: Change[] = [
  {
    date: 'August 8, 2022',
    changes: ['Added setting toggle to hide exam classes'],
  },
  {
    date: 'July 26, 2022',
    changes: ['Changed icon to open expanded view'],
  },
  {
    date: 'July 23, 2022',
    changes: ['Added support for custom user events'],
  },
  {
    date: 'June 21, 2022',
    changes: ['Option to hide full classes changed to hide all non-open classes (both full and on-hold)'],
  },
  {
    date: 'June 11, 2022',
    changes: ['Clashing classes are now displayed side by side instead of stacked on top of each other'],
  },
  {
    date: 'April 17, 2022',
    changes: [
      'Added expanded class view to see more details about a class',
      'Moved selecting between classes running at the same time to inside expanded class view',
    ],
  },
  {
    date: 'April 15, 2022',
    changes: ['Removed ability to sort search results alphabetically', 'Removed "Beta" from logo'],
  },
  {
    date: 'April 12, 2022',
    changes: [
      'Added autotimetabling',
      'Fixed bug which caused the timetable scrollbar to flash when changing between light and dark mode',
    ],
  },
  {
    date: 'April 4, 2022',
    changes: ['Arrows to select different class now appear on all instances of a class, not just the first one'],
  },
  {
    date: 'March 30, 2022',
    changes: ['Added history (undo, redo, reset)'],
  },
  {
    date: 'March 29, 2022',
    changes: ['Made privacy page prettier'],
  },
  {
    date: 'March 28, 2022',
    changes: ['Added icons to differentiate between UG and PG classes'],
  },
  {
    date: 'March 27, 2022',
    changes: ['Added DST support for ICS generation'],
  },
  {
    date: 'March 26, 2022',
    changes: ['Added ability to sort search results alphabetically', 'Hid Saturday column if courses had no Saturday classes'],
  },
  {
    date: 'March 18, 2022',
    changes: ['Bumped term number', 'Added icons to indicate course delivery mode', 'Made ICS save button prettier'],
  },
  {
    date: 'March 15, 2022',
    changes: ['Added ICS saving'],
  },
  {
    date: 'March 10, 2022',
    changes: ['Added ability to select between classes running at the same time'],
  },
  {
    date: 'March 8, 2022',
    changes: ['Added icon to indicate when class is full', 'Updated class colours'],
  },
  {
    date: 'March 5, 2022',
    changes: ['Added about us modal and settings modal'],
  },
];

const StyledTypography = styled(Typography)`
  padding-bottom: 5px;
`

const Changelog: React.FC = () => {
  return (
    <>
      <Timeline>
        {changelog.map(({ date, changes }) => (
          <TimelineItem>
            <TimelineOppositeContent color="text.primary" sx={{ maxWidth: '120px' }}>
              {date}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color='primary'/>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              {changes.map((change) => (
                <StyledTypography>{change}</StyledTypography>
              ))}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </>
  );
};

export default Changelog;
