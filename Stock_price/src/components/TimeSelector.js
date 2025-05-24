import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';

const TimeSelector = ({ value, onChange }) => (
  <ToggleButtonGroup value={value} exclusive onChange={(e, v) => v && onChange(v)}>
    <ToggleButton value={10}>10 min</ToggleButton>
    <ToggleButton value={30}>30 min</ToggleButton>
    <ToggleButton value={50}>50 min</ToggleButton>
  </ToggleButtonGroup>
);

export default TimeSelector;
