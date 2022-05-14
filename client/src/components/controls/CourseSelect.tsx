// excerpts from [https://codesandbox.io/s/material-demo-33l5y]
import Fuse from 'fuse.js';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { AddRounded, CheckRounded, CloseRounded, SearchRounded, VideocamOutlined, PersonOutline } from '@mui/icons-material';
import { Autocomplete, Box, Chip, InputAdornment, TextField, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/system';

import getCoursesList from '../../api/getCoursesList';
import { AppContext } from '../../context/AppContext';
import { maxAddedCourses, term, year } from '../../constants/timetable';
import { CourseCode, CourseData } from '../../interfaces/Course';
import { CourseOverview, CoursesList } from '../../interfaces/CourseOverview';
import NetworkError from '../../interfaces/NetworkError';
import { CourseSelectProps } from '../../interfaces/PropTypes';
import { CourseContext } from '../../context/CourseContext';
import { ThemeType } from '../../constants/theme';

const SEARCH_DELAY = 300;

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

let fuzzy = new Fuse<CourseOverview>([], searchOptions);

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
  color: ${({ theme }) => theme.palette.secondary.dark};
`;

const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'backgroundColor',
})<{
  backgroundColor: string;
}>`
  transition: none !important;
  background: ${({ backgroundColor, theme }) => backgroundColor || theme.palette.secondary.main} !important;
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

const CourseSelect: React.FC<CourseSelectProps> = ({ assignedColors, handleSelect, handleRemove }) => {
  const [coursesList, setCoursesList] = useState<CoursesList>([]);
  const [options, setOptionsState] = useState<CoursesList>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<CoursesList>([]);
  const searchTimer = useRef<number | undefined>();
  const listRef = useRef<VariableSizeList | null>(null);

  const { setAlertMsg, setErrorVisibility, setLastUpdated } = useContext(AppContext);
  const { selectedCourses } = useContext(CourseContext);

  useEffect(() => {
    if (!selectedCourses.length) {
      setSelectedValue([]);
      return;
    }

    setSelectedValue(
      selectedCourses
        .map((x) => x.code) // Get the course code of each course
        .map((code) => coursesList.find((course) => course.code === code)) // Get the corresponding CourseOverview for each CourseData object
        .filter((overview): overview is CourseOverview => overview !== undefined)
    );
  }, [selectedCourses, coursesList]);

  let defaultOptions = coursesList;
  // show relevant default options based of selected courses (TODO: improve)
  const getCourseArea = (courseCode: CourseCode) => courseCode.substring(0, 4);
  const courseAreas = selectedValue.map((course) => getCourseArea(course.code));
  if (selectedValue.length) {
    defaultOptions = defaultOptions.filter(
      (course) => courseAreas.includes(getCourseArea(course.code)) && !selectedValue.includes(course)
    );
  }

  const setOptions = (newOptions: CoursesList) => {
    listRef?.current?.scrollTo(0);
    setOptionsState(newOptions);
  };

  const search = (query: string) => {
    query = query.trim();

    if (query.length === 0) {
      setOptions(defaultOptions);
      return defaultOptions;
    }

    const newOptions = fuzzy.search(query).map((result) => result.item);
    setOptions(newOptions);

    return newOptions;
  };

  const onChange = (_: any, value: CoursesList) => {
    if (value.length > selectedValue.length) {
      handleSelect(value[value.length - 1].code);
      setSelectedValue([...value]);
    }
    setOptions(defaultOptions);
    setInputValue('');
  };

  const fetchCoursesList = async () => {
    try {
      const fetchedCoursesList = await getCoursesList(year, term);
      setCoursesList(fetchedCoursesList.courses);
      fuzzy = new Fuse(fetchedCoursesList.courses, searchOptions);
      setLastUpdated(fetchedCoursesList.lastUpdated);
    } catch (e) {
      if (e instanceof NetworkError) {
        setAlertMsg(e.message);
        setErrorVisibility(true);
      }
    }
  };

  useEffect(() => {
    fetchCoursesList();
  }, []);

  useEffect(() => {
    setOptions(defaultOptions);
  }, [coursesList]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      search(inputValue);
      searchTimer.current = undefined;
    }, SEARCH_DELAY);
  }, [inputValue, coursesList]);

  const shrinkLabel = inputValue.length > 0 || selectedValue.length > 0;

  const OuterElementContext = React.createContext({});

  const OuterElementType = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
    const outerProps = React.useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
  });

  const ListboxComponent = React.useCallback(
    React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
      const { children, ...other } = props;

      const itemCount = Array.isArray(children) ? children.length : 0;
      const getItemSize = () => 45;
      const maxResultsVisible = 6;
      const paddingTop = 7;
      const height = Math.min(itemCount, maxResultsVisible) * getItemSize();

      const Row: React.FC<ListChildComponentProps> = ({ data, index, style }) =>
        React.cloneElement(data[index], {
          style: {
            ...style,
            top: typeof style.top === 'number' ? style.top + paddingTop : 0,
          },
        });

      return (
        <div ref={ref} style={{ overflow: 'hidden' }}>
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
        </div>
      );
    }),
    []
  );

  const theme = useTheme<ThemeType>();
  const isMedium = useMediaQuery(theme.breakpoints.only('md'));
  const isTiny = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <StyledSelect>
      <Autocomplete
        getOptionDisabled={() => selectedCourses.length >= maxAddedCourses}
        getOptionLabel={(option) => option.name}
        multiple
        autoHighlight
        disableClearable
        disableListWrap
        noOptionsText="No Results"
        selectOnFocus={false}
        options={options}
        value={selectedValue}
        onChange={onChange}
        inputValue={inputValue}
        // prevent built-in option filtering
        filterOptions={(o) => o}
        ListboxComponent={ListboxComponent}
        isOptionEqualToValue={(option, value) => option.code === value.code}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <StyledOption>
              <StyledIcon>
                {selectedValue.find((course: CourseOverview) => course.code === option.code) ? <CheckRounded /> : <AddRounded />}
              </StyledIcon>
              <span>{option.code}</span>
              <Weak>{!(isMedium || isTiny) && option.name}</Weak>
              <Career>
                {option.career === 'Undergraduate'
                  ? 'UGRD'
                  : option.career === 'Postgraduate'
                  ? 'PGRD'
                  : option.career === 'Research'
                  ? 'RSCH'
                  : null}
              </Career>
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
        )}
        renderInput={(params) => (
          <StyledTextField
            {...params}
            autoFocus
            selectedCourses={selectedCourses}
            variant="outlined"
            label={selectedCourses.length < maxAddedCourses ? 'Select your courses' : 'Maximum courses selected'}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event: any) => {
              if (event.key === 'Backspace') {
                event.stopPropagation();
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
        renderTags={(value: CoursesList, getTagProps) =>
          value.map((option: CourseOverview, index: number) => (
            <StyledChip
              label={option.code}
              color="primary"
              backgroundColor={assignedColors[option.code]}
              deleteIcon={<CloseRounded />}
              {...getTagProps({ index })}
              onDelete={() => {
                setSelectedValue(selectedValue.filter((course) => course.code !== option.code));
                handleRemove(option.code);
              }}
            />
          ))
        }
      />
    </StyledSelect>
  );
};

export default CourseSelect;
