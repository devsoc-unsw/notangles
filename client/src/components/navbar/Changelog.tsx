import React from 'react';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@mui/lab';
import { Typography } from '@mui/material';
import { styled } from '@mui/system';

type Change = { date: String; changes: String[] };

const changelog: Change[] = [
  {
    date: 'March 11, 2023',
    changes: ["Added a clear button that completely resets the state of the timetable"],
  },
  {
    date: 'October 29, 2022',
    changes: ['Event can be created with a double click on the grid you want it to be created in'],
  },
  {
    date: 'September 28, 2022',
    changes: ['Custom events now encompass general and tutoring events'],
  },
  {
    date: 'September 11, 2022',
    changes: ['Autotimetabling now schedules around your custom events'],
  },
  {
    date: 'September 6, 2022',
    changes: ['Added ability to clone a created custom event'],
  },
  {
    date: 'September 3, 2022',
    changes: ['Backspace can be used to delete courses in the course selection search bar'],
  },
  {
    date: 'September 2, 2022',
    changes: ["Added setting to convert the timetable to the user's local timezone"],
  },
  {
    date: 'September 1, 2022',
    changes: ['Added ability to create a custom event that happens on multiple days'],
  },
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
`;

const Changelog: React.FC = () => {
  return (
    <>
      <Timeline>
        {changelog.map(({ date, changes }, idx) => (
          <TimelineItem key={idx}>
            <TimelineOppositeContent color="text.primary" sx={{ maxWidth: '120px' }}>
              {date}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="primary" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              {changes.map((change, idx) => (
                <StyledTypography key={idx}>{change}</StyledTypography>
              ))}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </>
  );
};

export default Changelog;
