// excerpts from [https://codesandbox.io/s/material-demo-33l5y]
import {
  AddRounded,
  ArrowDropDownRounded,
  CheckRounded,
  CloseRounded,
  PersonOutline,
  VideocamOutlined,
} from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  InputAdornment,
  Link,
  Menu,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Fuse from 'fuse.js';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';

import { getAllEvents } from '../../api/getEvents';
import { ThemeType } from '../../constants/theme';
import { maxAddedCourses } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { CourseOverview, CoursesList } from '../../interfaces/Courses';
import { CourseCode, CourseData, EventDTO } from '../../interfaces/Periods';
import { CourseSelectProps } from '../../interfaces/PropTypes';

type SearchMode = 'Courses' | 'Events';
type SearchOption = CourseOverview | EventDTO;

const isCourseOption = (option: SearchOption): option is CourseOverview => 'code' in option;

const SEARCH_DELAY = 300;

type FacultyMap = Record<string, string>;

interface SearchOptions {
  threshold: number;
  keys: {
    name: string;
    weight: number;
  }[];
}

const searchOptions: SearchOptions = {
  threshold: 0.4,
  keys: [
    {
      name: 'code',
      weight: 0.9,
    },
    {
      name: 'name',
      weight: 0.1,
    },
  ],
};

const eventSearchOptions: SearchOptions = {
  threshold: 0.4,
  keys: [
    {
      name: 'name',
      weight: 0.7,
    },
    {
      name: 'description',
      weight: 0.3,
    },
  ],
};

let fuzzy = new Fuse<CourseOverview>([], searchOptions);
let fuzzyEvents = new Fuse<EventDTO>([], eventSearchOptions);

const ListboxContainer = styled('div')`
  overflow: hidden;
`;

const StyledSelect = styled(Box)`
  width: 100%;
  text-align: left;
`;

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'selectedCourses',
})<{
  selectedCourses: CourseData[];
}>`
  .MuiOutlinedInput-root {
    fieldset {
      border-color: ${({ theme }) => theme.palette.secondary.main};
      transition: border-color 0.1s;
    }
    &:hover fieldset {
      border-color: ${({ theme }) => theme.palette.secondary.dark};
    }
    &.Mui-focused fieldset {
      border-color: ${({ theme }) => theme.palette.secondary.dark};
    }
  }

  label {
    color: ${({ theme, selectedCourses }) =>
      selectedCourses.length < maxAddedCourses ? theme.palette.secondary.dark : 'red'} !important;
    transition: 0.2s;
  }
`;

const StyledInputAdornment = styled(InputAdornment)`
  margin-left: 7px;
  margin-right: 0px;
  min-height: 30px;
  color: ${({ theme }) => theme.palette.secondary.dark};
`;

const StyledModeToggle = styled('div')`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  margin-right: 2px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ theme }) => theme.palette.secondary.dark};

  &:hover {
    background-color: ${({ theme }) => theme.palette.secondary.light};
  }
`;

const StyledEventOption = styled('span')`
  display: flex;
  align-items: center;
  width: 100%;
`;

const EventSocietyName = styled('span')`
  margin-left: 4px;
  font-weight: 600;
  white-space: nowrap;
`;

const EventDescription = styled('span')`
  margin-left: 8px;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  opacity: 0.7;
`;

const EventDateLabel = styled('span')`
  margin-left: 8px;
  flex-shrink: 0;
  white-space: nowrap;
  opacity: 0.6;
`;

const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'backgroundColor',
})<{
  backgroundColor: string;
}>`
  transition: none !important;
  color: ${({ theme }) => theme.palette.in_text.primary};
  background: ${({ backgroundColor, theme }) => backgroundColor || theme.palette.secondary.main} !important;

  .MuiChip-deleteIcon {
    color: ${({ theme }) => theme.palette.in_text.primary};
  }
`;

const StyledOption = styled('span')`
  display: flex;
  align-items: center;
  max-width: 80%;
`;

const StyledIcon = styled('span')`
  position: relative;
  top: 3px;
  margin-right: 12px;
  opacity: 0.6;
`;

const StyledIconRight = styled(StyledIcon)`
  margin-right: 0;
`;

const Weak = styled('span')`
  margin-left: 7px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.6;
`;

const StyledUl = styled('ul')`
  padding: 0;
  margin: 0;
`;

const RightContainer = styled('div')`
  position: absolute;
  right: 10px;
`;

const Career = styled('div')`
  position: absolute;
  right: 65px;
  opacity: 0.6;
`;

const FacultyButtonsContainer = styled('div')`
  display: flex;
  flex-wrap: wrap;
  margin: ${({ theme }) => theme.spacing(1.5, 0)};
  width: 100%;
`;

const FacultyTags = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'selectedFaculty' && prop !== 'faculty',
})<{
  selectedFaculty: string;
  faculty: string;
}>`
  margin: 5px;
  margin-left: 13px;
  margin-right: 0px;
  padding: 5px 12px;
  cursor: pointer;
  background-color: ${({ theme, selectedFaculty, faculty }) =>
    selectedFaculty === faculty ? theme.palette.primary.main : theme.palette.secondary.light};
  color: ${({ theme, selectedFaculty, faculty }) =>
    selectedFaculty === faculty ? '#FFFFFF' : theme.palette.secondary.dark};
  text-transform: none;
  font-size: 13px;
  &:hover {
    background-color: ${({ theme }) => theme.palette.primary.main};
    color: #ffffff;
  }
`;

const NoOptionsContainer = styled('div')`
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NoOptionsText = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const HelperLink = styled(Link)`
  cursor: pointer;
  font-size: 14px;
  &:hover {
    text-decoration: underline;
  }
`;

const COURSE_CODE_REGEX = /^[A-Z]{4}[0-9]{4}$/;

const CourseSelect: React.FC<CourseSelectProps> = ({ assignedColors, handleSelect, handleRemove, termSelectRef }) => {
  const [options, setOptionsState] = useState<SearchOption[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedEvents, setSelectedEvents] = useState<EventDTO[]>([]);
  const [selectedValue, setSelectedValue] = useState<CoursesList>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');

  const [searchMode, setSearchMode] = useState<SearchMode>('Courses');
  const [modeMenuAnchor, setModeMenuAnchor] = useState<HTMLElement | null>(null);

  const [eventsList, setEventsList] = useState<EventDTO[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<string>('');

  useEffect(() => {
    getAllEvents()
      .then(setEventsList)
      .catch(() => {
        setEventsList([]);
      });
  }, []);

  const societies = useMemo(() => Array.from(new Set(eventsList.map((event) => event.name))), [eventsList]);

  /**
   * @param society The name of the society to filter events by
   */
  const handleSocietyClick = (society: string) => {
    setSelectedSociety(selectedSociety === society ? '' : society);
  };

  const formatEventDate = (date: Date) => date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long' });

  /**
   * Switches between 'Courses' and 'Events' search mode, clearing any active filters from the other mode
   */
  const handleModeSwitch = () => {
    setSearchMode(searchMode === 'Courses' ? 'Events' : 'Courses');
    setModeMenuAnchor(null);
    setInputValue('');
    setSelectedFaculty('');
    setSelectedSociety('');
  };

  const faculties = [
    'Art, Design & Architecture',
    'Law & Justice',
    'Medicine & Health',
    'Engineering',
    'Business School',
    'Science',
  ];

  const facultyNameMap: FacultyMap = {
    'Art, Design & Architecture': 'Faculty of Arts, Design & Arch',
    'Law & Justice': 'Faculty of Law and Justice',
    Engineering: 'Faculty of Engineering',
    'Medicine & Health': 'Faculty of Medicine and Health',
    'Business School': 'UNSW Business School',
    Science: 'Faculty of Science',
  };

  const searchTimer = useRef<number | undefined>(undefined);
  const listRef = useRef<VariableSizeList | null>(null);

  const { coursesList } = useContext(AppContext);
  const { selectedCourses } = useContext(CourseContext);

  const shrinkLabel = inputValue.length > 0 || selectedValue.length > 0;
  // Horizontal offset of the resting label, clearing the Courses/Events toggle.
  const restingLabelOffset = searchMode === 'Courses' ? 96 : 86;

  useEffect(() => {
    fuzzy = new Fuse(coursesList, searchOptions);
  }, [coursesList]);

  useEffect(() => {
    fuzzyEvents = new Fuse(eventsList, eventSearchOptions);
  }, [eventsList]);

  // Generate a list of the user's selected courses
  useEffect(() => {
    // Skips this if searching for events
    if (searchMode === 'Events') return;

    if (!selectedCourses.length) {
      setSelectedValue([]);
      return;
    }

    setSelectedValue(
      selectedCourses
        // Get the corresponding CourseOverview for each CourseData object
        .map((x) => coursesList.find((course) => course.code === x.code && course.career === x.career))
        .filter((overview): overview is CourseOverview => overview !== undefined),
    );
  }, [selectedCourses, coursesList, searchMode]);

  /**
   * @param courseCode A course code
   * @returns The area of study of the course
   */
  const getCourseArea = (courseCode: CourseCode) => courseCode.substring(0, 4);

  /**
   * @param faculty The faculty of the course
   */
  const handleFacultyClick = (faculty: string) => {
    setSelectedFaculty(selectedFaculty === faculty ? '' : faculty);
    setInputValue('');
  };

  /**
   * @param career The career of the course
   * @returns The shortened career of the course
   */
  const getCourseCareer = (career: string) => {
    if (career === 'Undergraduate') {
      return 'UGRD';
    } else if (career === 'Postgraduate') {
      return 'PGRD';
    } else if (career === 'Research') {
      return 'RSCH';
    } else {
      return null;
    }
  };

  // Recalculates default options, memoized.
  const defaultOptions = useMemo<SearchOption[]>(() => {
    if (searchMode === 'Courses') {
      let courseOptions = coursesList;

      if (selectedFaculty) {
        const mappedFaculty = facultyNameMap[selectedFaculty];
        courseOptions = courseOptions.filter((course) => course.faculty === mappedFaculty);
      } else if (selectedValue.length > 0) {
        const courseAreas = selectedValue.map((course) => getCourseArea(course.code));
        courseOptions = courseOptions.filter(
          (course) => courseAreas.includes(getCourseArea(course.code)) && !selectedValue.includes(course),
        );
      }

      return courseOptions;
    } else {
      if (!selectedSociety) return eventsList;
      return eventsList.filter((event) => event.name === selectedSociety);
    }
  }, [searchMode, coursesList, eventsList, selectedFaculty, selectedSociety, selectedValue]);

  /**
   * Refresh the list of courses to choose from
   * @param newOptions The new list of courses to choose from
   */
  const setOptions = (newOptions: SearchOption[]) => {
    listRef?.current?.scrollTo(0);
    setOptionsState(newOptions);
  };

  useEffect(() => {
    setOptions(defaultOptions);
  }, [coursesList, eventsList, selectedFaculty, selectedSociety, searchMode]);

  /**
   * Filters the list of courses to only include the ones matching the search term
   * @param query The search query entered in the search bar
   */
  const search = (query: string) => {
    query = query.trim();

    if (searchMode === 'Events') {
      let searchOptionsList = eventsList;
      if (selectedSociety) {
        searchOptionsList = searchOptionsList.filter((event) => event.name === selectedSociety);
      }

      if (query.length === 0) {
        setOptions(searchOptionsList);
        return;
      }

      const fuzzyInst = new Fuse<EventDTO>(searchOptionsList, eventSearchOptions);
      const fuzzyResults = fuzzyInst.search(query).map((result) => result.item);
      setOptions(fuzzyResults);
      return;
    } else {
      if (query.length === 0) {
        setOptions(defaultOptions);
        return;
      }

      let searchOptionsList = coursesList;

      if (selectedFaculty) {
        searchOptionsList = searchOptionsList.filter((course) => course.faculty === facultyNameMap[selectedFaculty]);
      }

      const fuzzy = new Fuse<CourseOverview>(searchOptionsList, searchOptions);
      const fuzzyResults = fuzzy.search(query).map((result) => result.item);

      setOptions(fuzzyResults);
    }
  };

  // Add a delay between the search query changing and updating the search results
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      search(inputValue);
      searchTimer.current = undefined;
    }, SEARCH_DELAY);
  }, [inputValue, coursesList, searchMode, eventsList, selectedFaculty, selectedSociety]);

  // Handles selecting an event or course
  const onChange = (_: any, value: SearchOption[]) => {
    if (searchMode === 'Events') {
      const eventValue = value as EventDTO[];
      setSelectedEvents([...eventValue]);
      setInputValue('');
      setSelectedSociety('');
      return;
    }

    const courseValue = value as CoursesList;
    if (courseValue.length > selectedValue.length) {
      const added = courseValue[courseValue.length - 1];
      handleSelect({ code: added.code, career: added.career });
      setSelectedValue(courseValue);
    } else if (courseValue.length < selectedValue.length) {
      const removed = selectedValue.find((s) => !courseValue.some((c) => c.code === s.code && c.career === s.career));
      if (removed) handleRemove(removed.code);
      setSelectedValue(courseValue);
    }
    setOptions(defaultOptions);
    setInputValue('');
    setSelectedFaculty('');
  };

  const keyOf = (x: SearchOption) => {
    if (isCourseOption(x)) {
      return `${x.code}|${x.career}`;
    }
    return `${x.name}|${x.description}|${x.start.toISOString()}`;
  };

  const mergedOptions = useMemo(() => {
    const map = new Map<string, SearchOption>();
    options.forEach((x) => map.set(keyOf(x), x));
    if (searchMode === 'Courses') {
      selectedValue.forEach((x) => map.set(keyOf(x), x));
    }

    return Array.from(map.values());
  }, [options, selectedValue, searchMode]);

  const courseNotFound = useMemo(() => {
    const inputValTrim = inputValue.trim().toUpperCase();

    if (!COURSE_CODE_REGEX.test(inputValTrim)) return false;
    const exists = mergedOptions.some(
      (x) =>
        isCourseOption(x) && x.code === inputValTrim && (x.career === 'Undergraduate' || x.career === 'Postgraduate'),
    );

    return !exists;
  }, [inputValue, mergedOptions]);

  const OuterElementContext = React.createContext({});

  const OuterElementType = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
    const outerProps = React.useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
  });

  const theme = useTheme<ThemeType>();
  const ListboxComponent = React.useCallback(
    React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
      const { children, ...other } = props;

      const itemCount = Array.isArray(children) ? children.length : 0;
      const getItemSize = (i: number) => (i === 0 && courseNotFound && searchMode === 'Courses' ? 100 : 45);
      const maxResultsVisible = 6;
      const paddingTop = 0;

      const visibleCount = Math.min(itemCount, maxResultsVisible);
      const height: number = Array.from({ length: visibleCount }).reduce(
        (sum: number, _, i) => sum + getItemSize(i),
        0,
      );

      const Row: React.FC<ListChildComponentProps> = ({ data, index, style }) =>
        React.cloneElement(data[index], {
          style: {
            ...style,
            top: typeof style.top === 'number' ? style.top + paddingTop : 0,
          },
        });

      return (
        <ListboxContainer ref={ref}>
          <FacultyButtonsContainer
            onMouseDown={(event) => {
              event.preventDefault();
            }}
          >
            {(searchMode === 'Events' ? societies : faculties).map((label, index) => (
              <FacultyTags
                key={index}
                selectedFaculty={searchMode === 'Events' ? selectedSociety : selectedFaculty}
                faculty={label}
                onClick={() => {
                  if (searchMode === 'Events') {
                    handleSocietyClick(label);
                  } else {
                    handleFacultyClick(label);
                  }
                }}
                variant="contained"
                disableElevation
              >
                {label}
              </FacultyTags>
            ))}
          </FacultyButtonsContainer>
          <OuterElementContext.Provider value={other}>
            <VariableSizeList
              ref={listRef}
              style={{ overflowX: 'hidden' }}
              width="100%"
              height={height}
              itemData={children}
              itemCount={itemCount}
              itemSize={getItemSize}
              outerElementType={OuterElementType}
              innerElementType={StyledUl}
              overscanCount={5}
            >
              {Row}
            </VariableSizeList>
          </OuterElementContext.Provider>
        </ListboxContainer>
      );
    }),
    [selectedFaculty, selectedSociety, searchMode, societies, theme, courseNotFound],
  );

  const isMedium = useMediaQuery(theme.breakpoints.only('md'));
  const isTiny = useMediaQuery(theme.breakpoints.only('xs'));

  const handleHelperClick = () => {
    if (termSelectRef?.current) {
      termSelectRef.current.open();
    }
  };

  const NoOptions = () => (
    <NoOptionsContainer>
      <NoOptionsText variant="body2">
        Can&apos;t find <strong>{inputValue.trim().toUpperCase()}</strong>?
      </NoOptionsText>
      <HelperLink onClick={handleHelperClick} underline="hover" color={theme.palette.primary.main}>
        Make sure you&apos;ve picked the right term by using the &apos;Select term&apos; dropdown to the left or
        clicking here.
      </HelperLink>
    </NoOptionsContainer>
  );

  return (
    <StyledSelect>
      <Autocomplete<SearchOption, true, true, false>
        getOptionDisabled={() => searchMode === 'Courses' && selectedCourses.length >= maxAddedCourses}
        getOptionLabel={(option) => option.name}
        multiple
        autoHighlight
        disableClearable
        disableListWrap
        selectOnFocus={false}
        options={searchMode === 'Events' ? options : mergedOptions}
        noOptionsText={'No Results'}
        value={selectedValue}
        onChange={onChange}
        inputValue={inputValue}
        onBlur={() => {
          setSelectedFaculty('');
          setSelectedSociety('');
        }}
        // Prevent built-in option filtering
        filterOptions={(o) => o}
        ListboxComponent={ListboxComponent}
        isOptionEqualToValue={(option, value) => {
          if (isCourseOption(option) && isCourseOption(value)) {
            return option.code === value.code && option.career === value.career;
          }

          if (!isCourseOption(option) && !isCourseOption(value)) {
            return option.name === value.name && option.start.getTime() === value.start.getTime();
          }

          return false;
        }}
        renderOption={(props, option, { index }) => {
          const { key, ...rest } = props;

          if (!isCourseOption(option)) {
            const isSelected = selectedEvents.some(
              (e) => e.name === option.name && e.start.getTime() === option.start.getTime(),
            );
            return (
              <li key={key} {...rest}>
                <StyledEventOption>
                  <StyledIcon>{isSelected ? <CheckRounded /> : <AddRounded />}</StyledIcon>
                  <EventSocietyName>{option.name}</EventSocietyName>
                  <EventDescription>{option.description}</EventDescription>
                  <EventDateLabel>{formatEventDate(option.start)}</EventDateLabel>
                </StyledEventOption>
              </li>
            );
          }

          return courseNotFound && index === 0 ? (
            <NoOptions key={key} />
          ) : (
            <li key={key} {...rest}>
              <StyledOption>
                <StyledIcon>
                  {selectedValue.find(
                    (course: CourseOverview) => course.code === option.code && course.career === option.career,
                  ) ? (
                    <CheckRounded />
                  ) : (
                    <AddRounded />
                  )}
                </StyledIcon>
                <span>{option.code}</span>
                <Weak>{!(isMedium || isTiny) && option.name}</Weak>
                <Career>{getCourseCareer(option.career)}</Career>
                <RightContainer>
                  {option.online && (
                    <StyledIconRight>
                      <VideocamOutlined />
                    </StyledIconRight>
                  )}
                  {option.inPerson && (
                    <StyledIconRight>
                      <PersonOutline />
                    </StyledIconRight>
                  )}
                </RightContainer>
              </StyledOption>
            </li>
          );
        }}
        renderInput={(params) => (
          <StyledTextField
            {...params}
            autoFocus
            selectedCourses={selectedCourses}
            variant="outlined"
            label={
              searchMode === 'Courses'
                ? selectedCourses.length < maxAddedCourses
                  ? 'Select your courses'
                  : 'Maximum courses selected'
                : 'Select your Events'
            }
            onChange={(event) => {
              setInputValue(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && inputValue === '' && selectedValue.length > 0) {
                event.stopPropagation();
                setSelectedValue(selectedValue.slice(0, selectedValue.length - 1));
                handleRemove(selectedValue[selectedValue.length - 1].code);
              }
            }}
            InputLabelProps={{
              ...params.InputLabelProps,
              shrink: shrinkLabel,
              style: {
                marginLeft: shrinkLabel ? 2 : restingLabelOffset,
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <StyledInputAdornment position="start">
                    <StyledModeToggle
                      onMouseDown={(event) => {
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setModeMenuAnchor(event.currentTarget);
                      }}
                    >
                      {searchMode}
                      <ArrowDropDownRounded fontSize="small" />
                    </StyledModeToggle>
                    <Menu
                      anchorEl={modeMenuAnchor}
                      open={Boolean(modeMenuAnchor)}
                      onClose={() => {
                        setModeMenuAnchor(null);
                      }}
                      MenuListProps={{ dense: true, style: { paddingTop: 4, paddingBottom: 4 } }}
                    >
                      <MenuItem dense onClick={handleModeSwitch}>
                        {searchMode === 'Courses' ? 'Events' : 'Courses'}
                      </MenuItem>
                    </Menu>
                  </StyledInputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
        renderTags={(value, getTagProps) =>
          (value as SearchOption[]).map((option: SearchOption, index: number) => {
            const { key, ...rest } = getTagProps({ index });
            if (searchMode === 'Events') {
              return (
                <StyledChip
                  key={key}
                  {...rest}
                  label={option.name}
                  color="primary"
                  backgroundColor={'green'}
                  deleteIcon={<CloseRounded />}
                />
              );
            } else if (isCourseOption(option)) {
              return (
                <StyledChip
                  key={key}
                  {...rest}
                  label={option.code}
                  color="primary"
                  backgroundColor={assignedColors[option.code]}
                  deleteIcon={<CloseRounded />}
                  onDelete={() => {
                    setSelectedValue(selectedValue.filter((course) => course.code !== option.code));
                    handleRemove(option.code);
                  }}
                />
              );
            }
          })
        }
      />
    </StyledSelect>
  );
};

export default CourseSelect;
