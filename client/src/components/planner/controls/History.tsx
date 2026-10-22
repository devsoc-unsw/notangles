import { Delete, Redo, Undo } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { Term } from '../../../api/times/times';
import StyledDialog from '../../StyledDialog';
import { useTimetableHistory } from '../timetableTabs/TimetableTabContextMenu';

const isMacOS = navigator.userAgent.includes('Mac');
const clearTooltip = isMacOS ? 'Clear (Cmd+D)' : 'Clear (Ctrl+D)';
const undoTooltip = isMacOS ? 'Undo (Cmd+Z)' : 'Undo (Ctrl+Z)';
const redoTooltip = isMacOS ? 'Redo (Cmd+Shift+Z)' : 'Redo (Ctrl+Y)';

/** Toolbar buttons and hotkeys for clear/undo/redo. Logic lives in TimetableHistoryProvider. */
const History: React.FC<{ term: Term }> = ({ term }) => {
  const [clearOpen, setClearOpen] = useState(false);

  const { undo, redo, canUndo, canRedo, isReplaying, clear, canClear, isClearing } = useTimetableHistory();

  const disableUndo = isReplaying || !canUndo;
  const disableRedo = isReplaying || !canRedo;
  const disableClear = isClearing || !canClear;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const modifier = isMacOS ? event.metaKey : event.ctrlKey;
      if (!modifier) return;

      const key = event.key.toLowerCase();

      const isUndo = key === 'z' && !event.shiftKey;
      const isRedo = isMacOS ? key === 'z' && event.shiftKey : key === 'y';
      const isClear = key === 'd';

      if (!isUndo && !isRedo && !isClear) return;
      event.preventDefault();

      // undo/redo no-op when unavailable, so no guard needed.
      if (isUndo) undo();
      if (isRedo) redo();
      if (isClear && !disableClear) setClearOpen(true);
    },
    [disableClear, undo, redo],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      {/* Clear timetables Dialog */}
      <StyledDialog
        open={clearOpen}
        onClose={() => {
          setClearOpen(false);
        }}
        onConfirm={() => {
          clear();
          setClearOpen(false);
        }}
        title="Confirm Clear"
        content={`Are you sure you want to clear all timetables for ${term.name}?`}
        confirmButtonText="Clear"
      />
      <Tooltip title={clearTooltip}>
        <span>
          <IconButton
            disabled={disableClear}
            color="inherit"
            size="large"
            onClick={() => {
              setClearOpen(true);
            }}
          >
            <Delete />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={undoTooltip}>
        <span>
          <IconButton disabled={disableUndo} color="inherit" size="large" onClick={undo}>
            <Undo />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={redoTooltip}>
        <span>
          <IconButton disabled={disableRedo} color="inherit" size="large" onClick={redo}>
            <Redo />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};

export default History;
