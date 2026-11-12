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

/*
 * Timetable history (clear/undo/redo). State lives in React Query, so there's
 * nothing to snapshot - each change is recorded as an invertible action.
 * Undo replays the inverse; redo replays the action. Mounted in Planner.
 */

/** An undoable change. Must be self-contained so old entries replay correctly (hence `colour` on removals). */
export type TimetableAction =
  | { type: 'ADD_COURSE'; courseId: string; colour: string }
  | { type: 'REMOVE_COURSE'; courseId: string; colour: string };

interface HistoryStack {
  past: TimetableAction[];
  future: TimetableAction[];
}

// Oldest actions are dropped beyond this.
const MAX_STACK_SIZE = 50;

const invert = (action: TimetableAction): TimetableAction =>
  action.type === 'ADD_COURSE' ? { ...action, type: 'REMOVE_COURSE' } : { ...action, type: 'ADD_COURSE' };

interface TimetableHistoryContextType {
  /** Records a performed action and clears the redo stack. */
  recordAction: (action: TimetableAction) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** True while an undo/redo is in flight. */
  isReplaying: boolean;
  /** Replaces the term's timetables with one empty default. */
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

/** Keeps per-timetable undo/redo stacks; the exposed API targets the selected timetable. */
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

  // Prevents overlapping replays from applying the same action twice.
  const replaying = useRef(false);

  // Read via ref so undo/redo stay stable and don't re-render consumers.
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
      // Replays aren't new user actions.
      if (replaying.current) return;

      setStacks((prev) => {
        const { past = [] } = prev[timetableId] ?? {};
        return {
          ...prev,
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
          // The stack no longer matches the backend, so drop it.
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

  // `mutate` is stable, unlike the mutation object.
  const { mutate: mutateClear } = clearTimetables;

  const clear = useCallback(() => {
    // Old stacks are keyed by deleted ids, so they become unreachable.
    mutateClear({ year: term.year, term: term.term });
  }, [mutateClear, term.year, term.term]);

  const canUndo = (stacks[timetableId]?.past.length ?? 0) > 0;
  const canRedo = (stacks[timetableId]?.future.length ?? 0) > 0;
  // Nothing to clear with a single empty timetable.
  const canClear = timetableIds.length > 1 || courses.length > 0;

  // Excludes `stacks` so only canUndo/canRedo changes republish the context.
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
