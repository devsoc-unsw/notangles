import {
  AddRounded,
  CheckRounded,
  CloseRounded,
  PersonOutline,
  SearchRounded,
  VideocamOutlined,
} from '@mui/icons-material';
import { Autocomplete, Box, Button, Chip, debounce, InputAdornment, TextField, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import {
  cloneElement,
  createContext,
  forwardRef,
  HTMLProps,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';

import { Term, useCourseListQuery, useCoursesInfoQuery } from '../../../api/times/times';
import { useAddTimetableCourse, useRemoveTimetableCourse } from '../../../api/timetable/mutations';
import { useTimetableCoursesQuery } from '../../../api/timetable/queries';
import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { decodeColor, leastUsedColor } from '../../../utils/colors';

const MAX_COURSES = 10;

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
  selectedCourses: ReturnType<typeof useTimetableCoursesQuery>;
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
      selectedCourses.length < MAX_COURSES ? theme.palette.secondary.dark : 'red'} !important;
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

const displayCareer = (career: string) => {
  switch (career) {
    case 'Undergraduate':
      return 'UGRD';
    case 'Postgraduate':
      return 'PGRD';
    case 'Research':
      return 'RSCH';
    default:
      return '';
  }
};

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

// Display name -> GraphQL name
const faculties: Record<string, string> = {
  'Art, Design & Architecture': 'Faculty of Arts, Design & Arch',
  'Law & Justice': 'Faculty of Law and Justice',
  Engineering: 'Faculty of Engineering',
  'Medicine & Health': 'Faculty of Medicine and Health',
  'Business School': 'UNSW Business School',
  Science: 'Faculty of Science',
};

const CourseSelect: React.FC<{ term: Term; timetableId: string }> = ({ term, timetableId }) => {
  const [inputValue, setInputValue] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedInputValue = useMemo(() => debounce((value) => setSearchTerm(value), 150), []);
  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedInputValue.clear();
    };
  }, [debouncedInputValue]);

  const [faculty, setFaculty] = useState<string | undefined>(undefined);

  const courseList = useCourseListQuery(term);
  const fuse = useMemo(() => {
    return new Fuse(
      courseList.filter((course) => (faculty ? course.faculty === faculties[faculty] : true)),
      {
        keys: [
          {
            name: 'course_code',
            weight: 0.9,
          },
          {
            name: 'course_name',
            weight: 0.1,
          },
        ],
        threshold: 0.4,
      },
    );
  }, [courseList, faculty]);

  const queryClient = useQueryClient();
  const { preferredTheme } = useGetUserSettingsQuery();
  const selectedCourses = useTimetableCoursesQuery(timetableId);
  const selectedCoursesInfo = useCoursesInfoQuery(selectedCourses.map((course) => course.courseId));
  const removeCourseMutation = useRemoveTimetableCourse(queryClient);
  const addCourseMutation = useAddTimetableCourse(queryClient);

  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.only('md'));
  const isTiny = useMediaQuery(theme.breakpoints.only('xs'));
  const shrinkLabel = inputValue.length > 0 || selectedCourses.length > 0;

  const listRef = useRef<VariableSizeList | null>(null);
  const OuterElementContext = createContext({});
  const OuterElementType = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(function OBT(props, ref) {
    const outerProps = useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
  });

  const ListboxComponent = useMemo(
    () =>
      forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(function LB(props, ref) {
        const { children, ...other } = props;

        const itemCount = Array.isArray(children) ? children.length : 0;
        const getItemSize = () => 45;
        const maxVisibleItems = 6;
        const paddingTop = 0;
        const height = Math.min(itemCount, maxVisibleItems) * getItemSize();

        const Row: React.FC<ListChildComponentProps> = ({ data, index, style }) =>
          cloneElement(data[index], {
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
              {Object.keys(faculties).map((name, index) => (
                <FacultyTags
                  key={index}
                  selectedFaculty={faculty ?? ''}
                  faculty={name}
                  onClick={() => (faculty === name ? setFaculty(undefined) : setFaculty(name))}
                  variant="contained"
                  disableElevation
                >
                  {name}
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
    [faculty], // TODO: Do I add OuterElementContext and OuterElementType here?
  );

  return (
    <StyledSelect>
      <Autocomplete
        getOptionDisabled={() => selectedCourses.length >= MAX_COURSES}
        getOptionLabel={(option) => option.course_code}
        multiple
        autoHighlight
        disableClearable
        disableListWrap
        noOptionsText="No Results"
        selectOnFocus={false}
        options={courseList}
        value={selectedCoursesInfo}
        inputValue={inputValue}
        onChange={(_, value) => {
          setInputValue('');
          const addedCourses = value.filter((v) => !selectedCourses.some((c) => c.courseId === v.course_id));
          const removedCourses = selectedCourses.filter((c) => !value.some((v) => v.course_id === c.courseId));

          for (const course of removedCourses) {
            removeCourseMutation.mutate({ timetableId, courseId: course.courseId });
          }
          for (const course of addedCourses) {
            addCourseMutation.mutate({
              timetableId,
              courseId: course.course_id,
              colour: leastUsedColor(selectedCourses.map((c) => c.colour)),
              term,
            });
          }
        }}
        onBlur={() => {
          setFaculty(undefined);
        }}
        filterOptions={(options) => {
          if (searchTerm === '') return options.slice(0, 20);
          return fuse
            .search(searchTerm)
            .map((result) => result.item)
            .slice(0, 20);
        }}
        isOptionEqualToValue={(option, value) => option.course_id === value.course_id}
        renderOption={(props, option) => {
          const { key: _, ...rest } = props;
          return (
            <li key={option.course_id} {...rest}>
              <StyledOption>
                <StyledIcon>
                  {selectedCourses.find((course) => course.courseId === option.course_id) ? (
                    <CheckRounded />
                  ) : (
                    <AddRounded />
                  )}
                </StyledIcon>
                <span>{option.course_code}</span>
                <Weak>{!(isMedium || isTiny) && option.course_name}</Weak>
                <Career>{displayCareer(option.career)}</Career>
                <RightContainer>
                  {option.modes.includes('Online') && (
                    <StyledIconRight>
                      <VideocamOutlined />
                    </StyledIconRight>
                  )}
                  {option.modes.includes('In Person') && (
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
            label={selectedCourses.length < MAX_COURSES ? 'Select your courses' : 'Maximum courses reached'}
            onChange={(event) => {
              setInputValue(event.target.value);
              debouncedInputValue(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && inputValue === '' && selectedCourses.length > 0) {
                event.stopPropagation();
                const lastCourse = selectedCourses[selectedCourses.length - 1];
                removeCourseMutation.mutate({ timetableId, courseId: lastCourse.courseId });
              }
            }}
            slotProps={{
              inputLabel: {
                ...params.InputLabelProps,
                shrink: shrinkLabel,
                style: { marginLeft: shrinkLabel ? 2 : 38 },
              },
              input: {
                ...params.InputProps,
                startAdornment: (
                  <>
                    <StyledInputAdornment position="start">
                      <SearchRounded />
                    </StyledInputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              },
            }}
          />
        )}
        renderValue={(value, getItemProps) =>
          value.map((option, index) => {
            const { key: _, ...rest } = getItemProps({ index });

            return (
              <StyledChip
                key={option.course_id}
                {...rest}
                label={option.course_code}
                color="primary"
                backgroundColor={decodeColor(
                  selectedCourses.find((course) => course.courseId === option.course_id)?.colour || '',
                  preferredTheme,
                )}
                deleteIcon={<CloseRounded />}
                onDelete={() => removeCourseMutation.mutate({ timetableId, courseId: option.course_id })}
              />
            );
          })
        }
        slotProps={{ listbox: { component: ListboxComponent } }}
      />
    </StyledSelect>
  );
};

export default CourseSelect;
