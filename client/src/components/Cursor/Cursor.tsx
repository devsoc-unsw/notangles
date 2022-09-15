import { FC, useState } from 'react';
import NorthWestIcon from '@mui/icons-material/NorthWest';
import { styled } from '@mui/material';

interface ICursorProps {
  x?: number;
  y?: number;
  label?: string;
}

const Cursor: FC<ICursorProps> = ({ x, y, label }) => {
  const [color] = useState(() => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor}`;
  });
  const StyledCursor = styled('div')`
    position: absolute;
    top: ${y}px;
    left: ${x}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    /* Pick a random color */
    color: ${color};
  `;

  if (!x || !y) {
    return null;
  }

  return (
    <StyledCursor>
      <NorthWestIcon />
      <span>{label}</span>
    </StyledCursor>
  );
};

export default Cursor;
