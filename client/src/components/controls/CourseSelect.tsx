// excerpts from [https://codesandbox.io/s/material-demo-33l5y]
import {
  AddRounded,
  CheckRounded,
  CloseRounded,
  PersonOutline,
  SearchRounded,
  VideocamOutlined,
} from '@mui/icons-material';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Box,
  Button,
  Chip,
  InputAdornment,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Fuse from 'fuse.js';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';

import { useGetCoursesByTermAndFaculty } from '../../api/graphql/queries';
import { useGetUserSettingsQuery } from '../../api/user/queries';
import { ThemeType } from '../../constants/theme';
import { maxAddedCourses } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { decodeColor } from '../../hooks/useColorDecoder';
import { colorMapper } from '../../hooks/useColorMapper';
import { CourseCode, GQLCourseOverview } from '../../interfaces/Periods';

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
  selectedCourses: string[];
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
  min-height: 30px;
  color: ${({ theme }) => theme.palette.secondary.dark};
`;

const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'backgroundColor',
})<{
  backgroundColor?: string;
}>`
  transition: none !important;
  color: ${({ theme }) => theme.palette.in_text.primary};
  background: ${({ backgroundColor, theme }) => backgroundColor ?? theme.palette.secondary.main} !important;

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

const CourseSelect: React.FC = () => {
  const [options, setOptionsState] = useState<GQLCourseOverview[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<GQLCourseOverview[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const faculties = [
    'Art, Design & Architecture',
    'Law & Justice',
    'Medicine & Health',
    'Engineering',
    'Business School',
    'Science',
  ];

  const facultyNameMap = useMemo<FacultyMap>(
    () => ({
      'Art, Design & Architecture': 'Faculty of Arts, Design & Arch',
      'Law & Justice': 'Faculty of Law and Justice',
      Engineering: 'Faculty of Engineering',
      'Medicine & Health': 'Faculty of Medicine and Health',
      'Business School': 'UNSW Business School',
      Science: 'Faculty of Science',
    }),
    [],
  );

  const searchTimer = useRef<number | undefined>(undefined);
  const listRef = useRef<VariableSizeList | null>(null);

  const { term, timetables, selectedTimetableId, selectedCourses, addCourse, deleteCourse } = useContext(AppContext);
  const { preferredTheme } = useGetUserSettingsQuery();

  const courses = useGetCoursesByTermAndFaculty(term.substring(0, 2));

  useEffect(() => {
    const newSelected = Object.keys(timetables[selectedTimetableId].courses)
      .map((courseId) => courses.find((course) => course.id === courseId))
      .filter((course): course is GQLCourseOverview => course !== undefined);

    // Only update if the array contents are different
    const isSame =
      newSelected.length === selectedValue.length && newSelected.every((c, i) => c.id === selectedValue[i]?.id);

    if (!isSame) {
      setSelectedValue(newSelected);
    }
  }, [courses, selectedValue, selectedCourses, timetables, selectedTimetableId]);

  const setNewCourse = (course: GQLCourseOverview) => {
    let assignedColors: Record<string, string> = {};
    Object.entries(selectedCourses).forEach(([key, course]) => {
      assignedColors[key] = course.color;
    });
    const courseIds = Object.keys(timetables[selectedTimetableId].courses);
    assignedColors = colorMapper([...courseIds, course.id], assignedColors);
    addCourse({ id: course.id, code: course.code, color: assignedColors[course.id] });
    setSelectedValue((prev) => [...prev, course]);
  };

  const removeCourse = (courseId: string) => {
    // Remove the course from localStorage newData
    deleteCourse(courseId);
    setSelectedValue(selectedValue.filter((course) => course.id !== courseId));
  };

  useEffect(() => {
    console.table(timetables);
  }, [timetables]);

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

  // The courses shown when a user clicks on the search bar
  let defaultOptions = courses;

  if (selectedFaculty) {
    defaultOptions = defaultOptions.filter((course) => course.faculty === facultyNameMap[selectedFaculty]);
  }

  if (selectedValue.length && !selectedFaculty) {
    const courseAreas = selectedValue.map((course) => getCourseArea(course.code));

    // If there are courses selected, filter the default options to include courses in the same area of study
    defaultOptions = defaultOptions.filter(
      (course) => courseAreas.includes(getCourseArea(course.code)) && !selectedValue.includes(course),
    );
  }

  /**
   * Refresh the list of courses to choose from
   * @param newOptions The new list of courses to choose from
   */
  const setOptions = (newOptions: GQLCourseOverview[]) => {
    listRef.current?.scrollTo(0);
    setOptionsState((prev) => {
      // Only update if the array contents are different
      if (prev.length === newOptions.length && prev.every((opt, i) => opt.id === newOptions[i].id)) {
        return prev;
      }
      return newOptions;
    });
  };

  // Add a delay between the search query changing and updating the search results
  useEffect(() => {
    /**
     * Filters the list of courses to only include the ones matching the search term
     * @param query The search query entered in the search bar
     */
    const search = (query: string) => {
      query = query.trim();

      if (query.length === 0) {
        setOptions(defaultOptions);
        return defaultOptions;
      }

      let searchOptionsList = courses;
      if (selectedFaculty) {
        searchOptionsList = searchOptionsList.filter((course) => course.faculty === facultyNameMap[selectedFaculty]);
      }

      // create a new fuse instance with the searchOptionsList after filtering by faculty
      // so that it allows for searching within the faculty's options
      const fuzzy = new Fuse<GQLCourseOverview>(searchOptionsList, searchOptions);
      const fuzzyResults = fuzzy.search(query).map((result) => result.item);
      setOptions(fuzzyResults);
    };
    clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      search(inputValue);
      searchTimer.current = undefined;
    }, SEARCH_DELAY);
  }, [inputValue, courses, defaultOptions, selectedFaculty, facultyNameMap]);

  const onChange = (_: React.SyntheticEvent, value: GQLCourseOverview[]) => {
    if (value.length > selectedValue.length) {
      const newCourse = value.find((x) => !selectedValue.includes(x));
      if (newCourse) {
        setNewCourse(newCourse);
      }
      setSelectedValue([...value]);
    }
    setOptions(defaultOptions);
    setInputValue('');
    setSelectedFaculty('');
  };

  const mergedOptions = useMemo(() => {
    const map = new Map<string, GQLCourseOverview>();
    options.forEach((x) => map.set(x.id, x));
    selectedValue.forEach((x) => map.set(x.id, x));
    return Array.from(map.values());
  }, [options, selectedValue]);

  const shrinkLabel = inputValue.length > 0 || selectedValue.length > 0;

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
      const getItemSize = () => 45;
      const maxResultsVisible = 6;
      const paddingTop = 0;
      const height = Math.min(itemCount, maxResultsVisible) * getItemSize();

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
            {faculties.map((faculty, index) => (
              <FacultyTags
                key={index}
                selectedFaculty={selectedFaculty}
                faculty={faculty}
                onClick={() => {
                  handleFacultyClick(faculty);
                }}
                variant="contained"
                disableElevation
              >
                {faculty}
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
    [selectedFaculty, theme],
  );

  const isMedium = useMediaQuery(theme.breakpoints.only('md'));
  const isTiny = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <StyledSelect>
      <Autocomplete
        getOptionDisabled={() => timetables[selectedTimetableId].courseIds.length >= maxAddedCourses}
        getOptionLabel={(option) => option.code}
        multiple
        autoHighlight
        disableClearable
        disableListWrap
        noOptionsText="No Results"
        selectOnFocus={false}
        options={mergedOptions}
        value={selectedValue}
        onChange={onChange}
        inputValue={inputValue}
        onBlur={() => {
          setSelectedFaculty('');
        }}
        // Prevent built-in option filtering
        filterOptions={(o) => o}
        ListboxComponent={ListboxComponent}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          return (
            <li key={option.id} {...rest}>
              <StyledOption>
                <StyledIcon>
                  {selectedValue.find((course: GQLCourseOverview) => course.id === option.id) ? (
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
        renderInput={(params: AutocompleteRenderInputParams) => (
          <StyledTextField
            {...params}
            autoFocus
            selectedCourses={timetables[selectedTimetableId].courseIds}
            variant="outlined"
            label={
              timetables[selectedTimetableId].courseIds.length < maxAddedCourses
                ? 'Select your courses'
                : 'Maximum courses selected'
            }
            onChange={(event) => {
              setInputValue(event.target.value);
            }}
            onKeyDown={(event) => {
              // Delete the latest selected course if backspace is pressed
              if (event.key === 'Backspace' && inputValue === '' && selectedValue.length > 0) {
                event.stopPropagation();
                setSelectedValue(selectedValue.slice(selectedValue.length - 1));
                removeCourse(selectedValue[selectedValue.length - 1].id);
              }
            }}
            InputLabelProps={{
              ...params.InputLabelProps,
              shrink: shrinkLabel,
              style: {
                marginLeft: shrinkLabel ? 2 : 38,
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <StyledInputAdornment position="start">
                    <SearchRounded />
                  </StyledInputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
        renderValue={(value: GQLCourseOverview[], getTagProps) =>
          value.map((option: GQLCourseOverview, index: number) => {
            const { key, ...rest } = getTagProps({ index });
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const backgroundColor = selectedCourses[option.id]?.color;
            const decodedColor =
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              backgroundColor !== undefined ? decodeColor(backgroundColor, preferredTheme) : undefined;

            return (
              <StyledChip
                key={key}
                {...rest}
                label={option.code}
                color="primary"
                backgroundColor={decodedColor}
                deleteIcon={<CloseRounded />}
                onDelete={() => {
                  setSelectedValue(selectedValue.filter((course) => course.code !== option.code));
                  removeCourse(option.id);
                }}
              />
            );
          })
        }
      />
    </StyledSelect>
  );
};

export default CourseSelect;
