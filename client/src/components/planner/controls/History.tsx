import { Delete, Redo, Undo } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

const isMacOS = navigator.userAgent.includes('Mac');
const clearTooltip = isMacOS ? 'Clear (Cmd+D)' : 'Clear (Ctrl+D)';
const undoTooltip = isMacOS ? 'Undo (Cmd+Z)' : 'Undo (Ctrl+Z)';
const redoTooltip = isMacOS ? 'Redo (Cmd+Shift+Z)' : 'Redo (Ctrl+Y)';

const History: React.FC = () => {
  // TODO: Implement clear and history functionality

  return (
    <>
      <Tooltip title={clearTooltip}>
        <IconButton disabled={true} color="inherit" size="large">
          <Delete />
        </IconButton>
      </Tooltip>
      <Tooltip title={undoTooltip}>
        <span>
          <IconButton disabled={true} color="inherit" size="large">
            <Undo />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={redoTooltip}>
        <span>
          <IconButton disabled={true} color="inherit" size="large">
            <Redo />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};

export default History;
