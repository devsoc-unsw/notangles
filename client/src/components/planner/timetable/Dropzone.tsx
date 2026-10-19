import { PersonOutline, VideocamOutlined } from '@mui/icons-material';
import { Fade } from '@mui/material';
import type { RefCallback } from 'react';

import { DropzoneSurface, StyledDropzone } from '../../../styles/DropzoneStyles';

interface DropzoneProps {
  gridColumn: number;
  offsetMinutes?: number;
  durationMinutes?: number;
  backgroundColor: string;
  isHighlighted: boolean;
  isUnscheduled?: boolean;
  isSquareEdges: boolean;
  locations?: string[];
  label: string;
  elementRef: RefCallback<HTMLDivElement>;
  visible: boolean;
  fadeDuration: number;
}

const Dropzone = ({
  elementRef,
  label,
  locations = [],
  visible,
  fadeDuration,
  backgroundColor,
  ...props
}: DropzoneProps) => (
  <StyledDropzone ref={elementRef} {...props} aria-label={label} data-drop-highlighted={props.isHighlighted}>
    <Fade in={visible} timeout={fadeDuration} easing="ease">
      <DropzoneSurface style={{ backgroundColor: backgroundColor }}>
        {props.isUnscheduled ? (
          'Unscheduled'
        ) : (
          <>
            {locations.some((location) => location.includes('Online')) && <VideocamOutlined />}
            {locations.some((location) => !location.includes('Online')) && <PersonOutline />}
          </>
        )}
      </DropzoneSurface>
    </Fade>
  </StyledDropzone>
);

export default Dropzone;
