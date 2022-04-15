import React from 'react';
import { styled } from '@mui/system';

type Change = { date: String; changes: String[] };

const changelog: Change[] = [
  {
    date: '04/04/22',
    changes: ['Removed ability to sort search results alphabetically', 'Removed "Beta" from logo'],
  },
  {
    date: '12/04/22',
    changes: [
      'Added autotimetabling',
      'Fixed bug which caused the timetable scrollbar to flash when changing between light and dark mode',
    ],
  },
  {
    date: '04/04/22',
    changes: ['Arrows to select different class now appear on all instances of a class, not just the first one'],
  },
  {
    date: '30/03/22',
    changes: ['Added history (undo, redo, reset)'],
  },
  {
    date: '29/03/22',
    changes: ['Made privacy page prettier'],
  },
  {
    date: '28/03/22',
    changes: ['Added icons to differentiate between UG and PG classes'],
  },
  {
    date: '27/03/22',
    changes: ['Added DST support for ICS generation'],
  },
  {
    date: '26/03/22',
    changes: ['Added ability to sort search results alphabetically', 'Hid Saturday column if courses had no Saturday classes'],
  },
  {
    date: '18/03/22',
    changes: ['Bumped term number', 'Added icons to indicate course delivery mode', 'Made ICS save button prettier'],
  },
  {
    date: '15/03/22',
    changes: ['Added ICS saving'],
  },
  {
    date: '10/03/22',
    changes: ['Added ability to select between classes running at the same time'],
  },
  {
    date: '08/03/22',
    changes: ['Added icon to indicate when class is full', 'Updated class colours'],
  },
  {
    date: '05/03/22',
    changes: ['Added about us modal and settings modal'],
  },
];

const ChangeItem = styled('div')`
  padding: 0.5vh 0;
`;

const ChangeTitle = styled('div')`
  font-weight: bold;
  font-size: 1.1rem;
`;

const Changelog: React.FC = () => {
  return (
    <>
      {changelog.map(({ date, changes }, idx) => (
        <ChangeItem key={idx}>
          <ChangeTitle>{date}</ChangeTitle>
          <ul>
            {changes.map((change, idx) => (
              <li key={idx}>{change}</li>
            ))}
          </ul>
        </ChangeItem>
      ))}
    </>
  );
};

export default Changelog;
