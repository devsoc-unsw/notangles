import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOthers, useUpdateMyPresence } from '../../utils/liveblocks.config';
import Cursor from '../Cursor/Cursor';

const UserPresence = () => {
  const others = useOthers();
  const auth = useAuth();
  const othersCursors = others.map((other) => other.presence?.cursor);

  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateMyPresence({
        cursor: {
          x: e.clientX,
          y: e.clientY,
          label: auth.user?.name || 'Anonymous',
        },
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [updateMyPresence]);

  return (
    <>
      {othersCursors.map((cursor, index: number) => (
        <Cursor key={index} x={cursor?.x} y={cursor?.y} />
      ))}
    </>
  );
};

export default UserPresence;
