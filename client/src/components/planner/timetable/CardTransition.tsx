import { useMediaQuery } from '@mui/material';
import { type ReactElement, type Ref, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

import { transitionTime } from '../../../constants/timetable';

export interface CardTransitionChildProps {
  cardRef?: Ref<HTMLDivElement>;
  className?: string;
  isExiting?: boolean;
}

interface CardTransitionProps {
  in?: boolean;
  appear?: boolean;
  enableEnter?: boolean;
  enableExit?: boolean;
  onExited?: () => void;
  children: (props: CardTransitionChildProps) => ReactElement;
}

const CardTransition = ({ in: visible = true, children, ...props }: CardTransitionProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <CSSTransition
      {...props}
      in={visible}
      nodeRef={nodeRef}
      classNames="card-fade"
      timeout={reducedMotion ? 0 : transitionTime}
    >
      {children({ cardRef: nodeRef, isExiting: !visible })}
    </CSSTransition>
  );
};

export default CardTransition;
