import React from 'react';
import styled from 'styled-components';

type Change = { date: String; changes: String[] };

const changelog: Change[] = [
  {
    date: '05/03/22',
    changes: ['Added about us modal and settings modal'],
  },
  {
    date: '08/03/22',
    changes: ['Added icon to indicate when class is full', 'Updated class colours'],
  },
  {
    date: '10/03/22',
    changes: ['Added ability to select between classes running at the same time'],
  },
  {
    date: '15/03/22',
    changes: ['Added ICS saving'],
  },
  {
    date: '18/03/22',
    changes: ['Bumped term number', 'Added icons to indicate course delivery mode'],
  },
  {
    date: '18/03/22',
    changes: ['Made ICS save button prettier'],
  },
  {
    date: '26/03/22',
    changes: ['Added ability to sort search results alphabetically', 'Hid Saturday column if courses had no Saturday classes'],
  },
  {
    date: '27/03/22',
    changes: ['Added DST support for ICS generation'],
  },
  {
    date: '28/03/22',
    changes: ['Added icons to differentiate between UG and PG classes'],
  },
  {
    date: '29/03/22',
    changes: ['Made privacy page prettier'],
  },
  {
    date: '30/03/22',
    changes: ['Added history (undo, redo, reset)'],
  },
  {
    date: '04/04/22',
    changes: [
      'Arrows to select different class now appear on all instances of a class, not just the first one',
      'Added API call to automatically determine whether it is DST or not',
    ],
  },
];

const ChangeItem = styled.div`
  padding: 0.5vh 0;
`;

const ChangeTitle = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
`;

const ChangeLogContent = () => {
  return (
    <>
      {changelog.reverse().map(({ date, changes }) => (
        <ChangeItem>
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

export default ChangeLogContent;
