import React, { useContext } from 'react';
import { CourseContext } from '../../context/CourseContext';
import DroppedEvent from './DroppedEvent';

const DroppedEvents: React.FC<{}> = ({}) => {
  const { createdEvents } = useContext(CourseContext);
  return (
    // <CSSTransition style={{ display: 'contents' }} transitionName={transitionName} timeout={transitionTime}>
    // </CSSTransition>
    <div style={{ display: 'contents' }}>
      {Object.entries(createdEvents).map(([a, ev]) => (
        <DroppedEvent recordKey={a} key={a} eventPeriod={ev} />
      ))}
    </div>
  );
};

export default DroppedEvents;
