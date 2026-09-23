import { Close, Edit, EditNote, FileCopy, Save, Star } from '@mui/icons-material';
import {
  Button,
  Dialog,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Term } from '../../../api/times/times';
import {
  useAddTimetableCourse,
  useClearTimetables,
  useDeleteTimetable,
  useDuplicateTimetable,
  useMakePrimaryTimetable,
  useRemoveTimetableCourse,
  useRenameTimetable,
} from '../../../api/timetable/mutations';
import {
  useTimetableCoursesQuery,
  useTimetableIdsQuery,
  useTimetableInfoQueries,
  useTimetableInfoQuery,
} from '../../../api/timetable/queries';
import {
  StyledDialogContent,
  StyledDialogTitle,
  StyledTitleContainer,
  StyledTopIcons,
} from '../../../styles/ControlStyles';
import { ExecuteButton, RedDeleteIcon, RedListItemText, StyledMenu } from '../../../styles/CustomEventStyles';
import { StyledSnackbar } from '../../../styles/TimetableTabStyles';
import StyledDialog from '../../StyledDialog';

/* -------------------------------------------------------------------------- */
/*  Timetable history (clear / undo / redo)                                    */
/*                                                                            */
/*  Server state is read through React Query, so there is no local object to   */
/*  snapshot. Instead each change is recorded as an action that can be applied  */
/*  and inverted on demand; undo replays the inverse, redo replays it again.    */
/*                                                                            */
/*  The provider is mounted in Planner (context flows down, and both the       */
/*  toolbar buttons and the course picker need it), but the logic lives here.  */
/* -------------------------------------------------------------------------- */

/**
 * A single undoable change to a timetable.
 *
 * Every action must carry enough information to be applied *and* inverted
 * without reading the current timetable state, so that a stale entry deep in
 * the stack still replays correctly. `colour` is stored on removals for exactly
 * this reason - undoing a removal has to restore the original colour.
 */
export type TimetableAction =
  | { type: 'ADD_COURSE'; courseId: string; colour: string }
  | { type: 'REMOVE_COURSE'; courseId: string; colour: string };

interface HistoryStack {
  past: TimetableAction[];
  future: TimetableAction[];
}

// Caps memory usage on long sessions - older actions are dropped from the bottom.
const MAX_STACK_SIZE = 50;

const invert = (action: TimetableAction): TimetableAction =>
  action.type === 'ADD_COURSE' ? { ...action, type: 'REMOVE_COURSE' } : { ...action, type: 'ADD_COURSE' };

interface TimetableHistoryContextType {
  /** Records an action that has just been performed, discarding any pending redos. */
  recordAction: (action: TimetableAction) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** True while an undo/redo is being replayed against the backend. */
  isReplaying: boolean;
  /** Deletes every timetable in the term, leaving one empty default. */
  clear: () => void;
  canClear: boolean;
  isClearing: boolean;
}

const TimetableHistoryContext = createContext<TimetableHistoryContextType>({
  recordAction: () => undefined,
  undo: () => undefined,
  redo: () => undefined,
  canUndo: false,
  canRedo: false,
  isReplaying: false,
  clear: () => undefined,
  canClear: false,
  isClearing: false,
});

/**
 * Holds undo/redo stacks per timetable, so switching tabs preserves each tab's
 * history, while exposing an API bound to the currently selected timetable so
 * consumers cannot address the wrong one.
 */
export function TimetableHistoryProvider({
  term,
  timetableId,
  children,
}: {
  term: Term;
  timetableId: string;
  children: React.ReactNode;
}) {
  const [stacks, setStacks] = useState<Record<string, HistoryStack | undefined>>({});
  const [isReplaying, setIsReplaying] = useState(false);

  const { mutateAsync: addCourse } = useAddTimetableCourse();
  const { mutateAsync: removeCourse } = useRemoveTimetableCourse();
  const clearTimetables = useClearTimetables();

  const timetableIds = useTimetableIdsQuery(term);
  const courses = useTimetableCoursesQuery(timetableId);

  // Guards against a second undo/redo being kicked off while one is in flight,
  // which would otherwise read a stale stack and replay the same action twice.
  const replaying = useRef(false);

  // `step` reads the stacks through a ref rather than closing over the state, so
  // that undo/redo keep a stable identity. Otherwise every recorded action would
  // publish a new context value and re-render every consumer.
  const stacksRef = useRef(stacks);
  useEffect(() => {
    stacksRef.current = stacks;
  }, [stacks]);

  const applyAction = useCallback(
    async (action: TimetableAction) => {
      if (action.type === 'ADD_COURSE') {
        await addCourse({ timetableId, courseId: action.courseId, colour: action.colour });
      } else {
        await removeCourse({ timetableId, courseId: action.courseId });
      }
    },
    [timetableId, addCourse, removeCourse],
  );

  const recordAction = useCallback(
    (action: TimetableAction) => {
      // An undo/redo re-applies an action that is already on the stack, so the
      // resulting mutation must not be recorded as a fresh user action.
      if (replaying.current) return;

      setStacks((prev) => {
        const { past = [] } = prev[timetableId] ?? {};
        return {
          ...prev,
          // Branching off the current position discards the redo stack.
          [timetableId]: { past: [...past, action].slice(-MAX_STACK_SIZE), future: [] },
        };
      });
    },
    [timetableId],
  );

  const step = useCallback(
    (direction: 'undo' | 'redo') => {
      if (replaying.current) return;

      const stack = stacksRef.current[timetableId];
      const source = direction === 'undo' ? stack?.past : stack?.future;
      if (!source || source.length === 0) return;

      const action = source[source.length - 1];
      // Undoing performs the opposite of what was originally done; redoing
      // performs it again as-is.
      const toApply = direction === 'undo' ? invert(action) : action;

      replaying.current = true;
      setIsReplaying(true);

      applyAction(toApply)
        .then(() => {
          setStacks((prev) => {
            const current = prev[timetableId] ?? { past: [], future: [] };
            return {
              ...prev,
              [timetableId]:
                direction === 'undo'
                  ? { past: current.past.slice(0, -1), future: [...current.future, action] }
                  : { past: [...current.past, action], future: current.future.slice(0, -1) },
            };
          });
        })
        .catch(() => {
          // The backend rejected the replay, so the stack no longer describes
          // reality. Drop this timetable's history rather than let the user
          // walk further back through entries that can't be trusted.
          setStacks((prev) => ({ ...prev, [timetableId]: { past: [], future: [] } }));
        })
        .finally(() => {
          replaying.current = false;
          setIsReplaying(false);
        });
    },
    [timetableId, applyAction],
  );

  const undo = useCallback(() => {
    step('undo');
  }, [step]);

  const redo = useCallback(() => {
    step('redo');
  }, [step]);

  // `mutate` is stable, so binding it here keeps `clear` stable across the
  // mutation's idle -> pending -> settled transitions.
  const { mutate: mutateClear } = clearTimetables;

  const clear = useCallback(() => {
    // Stacks are keyed by timetable id, and every id they refer to is about to
    // be deleted, so the stale entries become unreachable on their own.
    mutateClear({ year: term.year, term: term.term });
  }, [mutateClear, term.year, term.term]);

  const canUndo = (stacks[timetableId]?.past.length ?? 0) > 0;
  const canRedo = (stacks[timetableId]?.future.length ?? 0) > 0;
  // Nothing to clear when a single, empty timetable is all that exists.
  const canClear = timetableIds.length > 1 || courses.length > 0;

  // Every dependency here is a primitive or a stable callback - deliberately not
  // `stacks` itself, so pushing an action that doesn't flip canUndo/canRedo does
  // not republish the context to every consumer.
  const value = useMemo(
    () => ({
      recordAction,
      undo,
      redo,
      canUndo,
      canRedo,
      isReplaying,
      clear,
      canClear,
      isClearing: clearTimetables.isPending,
    }),
    [recordAction, undo, redo, canUndo, canRedo, isReplaying, clear, canClear, clearTimetables.isPending],
  );

  return <TimetableHistoryContext.Provider value={value}>{children}</TimetableHistoryContext.Provider>;
}

export function useTimetableHistory() {
  return useContext(TimetableHistoryContext);
}

interface TimetableTabContextMenuProps {
  anchorElement: null | { x: number; y: number };
  setAnchorElement: (anchorElement: null | { x: number; y: number }) => void;
  selectedTimetableId: string;
  selectTimetableId: (id: string) => void;
  term: Term;
}

const TimetableTabContextMenu = ({
  anchorElement,
  setAnchorElement,
  selectedTimetableId,
  selectTimetableId,
  term,
}: TimetableTabContextMenuProps) => {
  const isMacOS = navigator.userAgent.includes('Mac');
  const deleteTimetabletip = isMacOS ? 'Delete Tab (Cmd+Shift+x)' : 'Delete Tab (Ctrl+Shift+x)';

  const { name, primary } = useTimetableInfoQuery(selectedTimetableId);
  const timetableIds = useTimetableIdsQuery(term);
  const timetables = useTimetableInfoQueries(timetableIds);
  const deleteTimetable = useDeleteTimetable();
  const renameTimetable = useRenameTimetable();
  const duplicateTimetable = useDuplicateTimetable();
  const setPrimaryTimetable = useMakePrimaryTimetable();

  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [renamedString, setRenamedString] = useState<string>('');
  const [renamedHelper, setRenamedHelper] = useState<string>('');
  const [renamedErr, setRenamedErr] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [openRestoreAlert, setOpenRestoreAlert] = useState<boolean>(false);

  const primaryTimetableId = timetables.find((t) => t.primary)?.id;

  // TODO: Reimplement hotkey for creating a timetable
  // TODO: Reimplement hotkey for deleting a timetable

  // Hotkey to confirm delete prompt by pressing enter button
  useEffect(() => {
    const handleDeleteEnterShortcut = (event: KeyboardEvent) => {
      const deleteConfirm = document.getElementById('confirm-delete-button');
      if (deleteOpen && event.key === 'Enter') {
        event.preventDefault();
        deleteConfirm?.focus();
        deleteConfirm?.click();
      }
    };

    document.addEventListener('keydown', handleDeleteEnterShortcut);

    return () => {
      document.removeEventListener('keydown', handleDeleteEnterShortcut);
    };
  }, [deleteOpen]);

  // TODO: Reimplement hotkey for confirming rename prompt

  // TODO: Implement restore logic
  // Action button for the restore deleted timetable snackbar
  const restoreTimetable = (
    <>
      <Button
        sx={{ color: '#3a76f8', fontSize: 'small' }}
        onClick={() => {
          setOpenRestoreAlert(false);
        }}
      >
        Undo
      </Button>
      <IconButton aria-label="close" color="inherit" sx={{ color: '#3a76f8' }}>
        <Close fontSize="small" />
      </IconButton>
    </>
  );

  // Handle changes to deleting a timetable
  const handleDeleteTimetable = () => {
    const currentIndex = timetableIds.indexOf(selectedTimetableId);
    const newIndex = currentIndex === 0 ? 0 : currentIndex - 1;
    selectTimetableId(timetableIds[newIndex]);
    deleteTimetable.mutate({
      timetableId: selectedTimetableId,
      onSuccess: () => {
        setOpenRestoreAlert(true);
        handleMenuClose();
      },
    });
  };

  // Handler to duplicate the selected timetable
  const handleDuplicateTimetable = () => {
    // TODO: Handle error case where exceeds timetable limit (on BE)
    duplicateTimetable.mutate({
      timetableId: selectedTimetableId,
      onSuccess: (id: string) => {
        selectTimetableId(id);
      },
    });
    handleMenuClose();
  };

  // Handle changes to the rename text field
  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const str = e.target.value;
    setRenamedString(str);
    setRenamedHelper(`${String(str.length)}/30`);
    setRenamedErr(str.length > 30);
  };

  const handleRenameOpen = () => {
    setRenamedString(name);
    setRenamedHelper(`${String(name.length)}/30`);
    setRenamedErr(name.length > 30);
    setRenameOpen(true);
  };

  // Collapse all modals and menus
  const handleMenuClose = useCallback(() => {
    setRenameOpen(false);
    setDeleteOpen(false);
    setAnchorElement(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <StyledMenu
        open={anchorElement !== null}
        anchorReference="anchorPosition"
        anchorPosition={anchorElement !== null ? { top: anchorElement.y, left: anchorElement.x } : undefined}
        onClose={handleMenuClose}
        autoFocus={false}
      >
        <Tooltip title={primary ? 'This timetable is already primary' : ''}>
          <MenuItem
            onClick={() => {
              if (primaryTimetableId === undefined) return;

              setPrimaryTimetable.mutate({
                timetableId: selectedTimetableId,
                currentPrimaryTimetableId: primaryTimetableId,
              });
              handleMenuClose();
            }}
            sx={{ opacity: primary ? 0.5 : 1 }}
          >
            <ListItemIcon>
              <Star fontSize="small" />
            </ListItemIcon>
            <ListItemText>Set as primary</ListItemText>
          </MenuItem>
        </Tooltip>
        <MenuItem onClick={handleRenameOpen}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicateTimetable}>
          <ListItemIcon>
            <FileCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <Divider />
        <Tooltip title={deleteTimetabletip}>
          <MenuItem
            onClick={() => {
              setDeleteOpen(true);
            }}
          >
            <ListItemIcon>
              <RedDeleteIcon fontSize="small" />
            </ListItemIcon>
            <RedListItemText>Delete</RedListItemText>
          </MenuItem>
        </Tooltip>
      </StyledMenu>

      {/* Rename timetable Dialog  */}
      <Dialog open={renameOpen} maxWidth="sm" onClose={handleMenuClose}>
        <StyledTopIcons>
          <IconButton aria-label="close">
            <Close />
          </IconButton>
        </StyledTopIcons>
        <StyledDialogTitle>
          <StyledTitleContainer>Rename Timetable</StyledTitleContainer>
        </StyledDialogTitle>
        <StyledDialogContent>
          <ListItem>
            <ListItemIcon sx={{ paddingBottom: 2 }}>
              <EditNote />
            </ListItemIcon>
            <TextField
              fullWidth={true}
              id="outlined-required"
              required
              variant="outlined"
              helperText={renamedHelper}
              value={renamedString}
              error={renamedErr}
              onChange={handleRenameChange}
            />
          </ListItem>
        </StyledDialogContent>

        <ExecuteButton
          variant="contained"
          color="primary"
          id="confirm-rename-button"
          disableElevation
          disabled={renamedString === '' || renamedErr}
          onClick={() => {
            renameTimetable.mutate({ timetableId: selectedTimetableId, newName: renamedString });
            handleMenuClose();
          }}
        >
          <Save />
          SAVE
        </ExecuteButton>
      </Dialog>

      {/* Delete timetable Dialog  */}
      <StyledDialog
        open={deleteOpen}
        title="Confirm Deletion"
        content="Are you sure you want to delete this current timetable?"
        confirmButtonText="Delete"
        confirmButtonId="confirm-delete-button"
        onClose={handleMenuClose}
        onConfirm={handleDeleteTimetable}
      />
      {/* Restore deleted timetable Alert */}
      <StyledSnackbar
        open={openRestoreAlert}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => {
          setOpenRestoreAlert(false);
        }}
        message="Timetable Deleted"
        action={restoreTimetable}
      />
    </>
  );
};

export default TimetableTabContextMenu;
