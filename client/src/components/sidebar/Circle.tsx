import styled from '@emotion/styled';
import React from 'react';

interface CircleProps {
  size: number;
}

interface StyledCircleProps {
  size: number
}

const StyledCircle: React.FC<StyledCircleProps> = styled('div')(({ size }) => ({
  width: size,
  height: size,
  borderRadius: 999,
  border: '1px grey solid',
}));

const Circle: React.FC<CircleProps> = ({ size }) => {
  return <StyledCircle size={size} />;
};

export default Circle;
