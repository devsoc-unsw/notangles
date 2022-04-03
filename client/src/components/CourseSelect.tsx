// excerpts from [https://codesandbox.io/s/material-demo-33l5y]
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTheme } from '@material-ui/styles';
import { useMediaQuery } from '@material-ui/core';

import { Box, Chip, InputAdornment, TextField, Theme } from '@material-ui/core';
import { AddRounded, CheckRounded, CloseRounded, SearchRounded, VideocamOutlined, PersonOutline } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';

import Fuse from 'fuse.js';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import styled, { css } from 'styled-components';

import getCoursesList from '../api/getCoursesList';
import { AppContext } from '../context/AppContext';
import { maxAddedCourses, term, year } from '../constants/timetable';
import { CourseData } from '../interfaces/Course';
import { CourseOverview, CoursesList } from '../interfaces/CourseOverview';
import NetworkError from '../interfaces/NetworkError';
import { CourseSelectProps } from '../interfaces/PropTypes';
import { CourseContext } from '../context/CourseContext';
import { ThemeType } from '../constants/theme';

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

const StyledTextField = styled(TextField)<{
  theme: Theme;
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

const StyledChip = styled(Chip).withConfig({
  shouldForwardProp: (prop) => !['backgroundColor'].includes(prop),
})<{
  backgroundColor: string;
}>`
  transition: none !important;
  background: ${({ backgroundColor, theme }) => backgroundColor || theme.palette.secondary.main} !important;
`;

const StyledOption = styled.span`
  display: flex;
  align-items: center;
  max-width: 80%;
`;

const weakStyle = css`
  opacity: 0.6;
`;

const StyledIcon = styled.span`
  position: relative;
  top: 3px;
  margin-right: 12px;
  ${weakStyle}
`;

const StyledIconRight = styled(StyledIcon)`
  margin-right: 0;
`;

const Weak = styled.span`
  margin-left: 7px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${weakStyle}
`;

const StyledUl = styled.ul`
  padding: 0;
  margin: 0;
`;

const RightContainer = styled.div`
  position: absolute;
  right: 10px;
`;

const Career = styled.div`
  position: absolute;
  right: 65px;
  ${weakStyle};
`;

const CourseSelect: React.FC<CourseSelectProps> = ({ assignedColors, handleSelect, handleRemove }) => {
  const { isSortAlphabetic } = useContext(AppContext);

  const [coursesList, setCoursesList] = useState<CoursesList>([]);
  const [options, setOptionsState] = useState<CoursesList>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<CoursesList>([]);
  const searchTimer = useRef<number | undefined>();
  const listRef = useRef<VariableSizeList | null>(null);

  const { setErrorMsg, setErrorVisibility, setLastUpdated } = useContext(AppContext);
  const { selectedCourses } = useContext(CourseContext);

  useEffect(() => {
    // Need to convert from the type CourseData to CourseOverview (a simpler version)
    // Note that CoursesList is a type alias for CourseOverview[]

    const courseCodes = selectedCourses.map((x) => x.code);
    const courseOverviews = courseCodes
      .map((code) => coursesList.find((course) => course.code === code))
      .filter((overview): overview is CourseOverview => overview !== undefined);

    if (courseOverviews.length) {
      setSelectedValue([...courseOverviews]);
    } else {
      // Reuse the old selected value (if it exists)
      setSelectedValue(selectedValue.length ? [selectedValue[0]] : []);
    }
  }, [selectedCourses]);

  const setOptions = (newOptions: CoursesList) => {
    listRef?.current?.scrollTo(0);
    setOptionsState(newOptions);
  };

  const diffCourses = (a: { code: string }[], b: { code: string }[]) => {
    const codes = a.map((x) => x.code);
    return b.filter((x) => !codes.includes(x.code));
  };

  const checkExternallyAdded = () => {
    const addedCodes = diffCourses(selectedValue, selectedCourses).map((x) => x.code);
    const coursesListCodes = coursesList.map((x) => x.code);

    // if we have info about the new courses already fetched, update the value now
    // (otherwise, `checkExternallyAdded` will be called later once the data is fetched)
    if (addedCodes.length > 0 && addedCodes.every((code) => coursesListCodes.includes(code))) {
      setSelectedValue([
        ...selectedValue,
        ...addedCodes.map((code) => coursesList.find((course) => course.code == code) ?? selectedValue[0]),
      ]); // the nullish coalesce above was the best way I found to shut ts up.
    } //the if statement above already checks that the code is in courselistcodes so find should never have to return undefined anyway
  };

  checkExternallyAdded();

  let defaultOptions = coursesList;
  // show relevant default options based of selected courses (TODO: improve)
  const getCourseArea = (courseCode: string) => courseCode.substring(0, 4);
  const courseAreas = selectedValue.map((course) => getCourseArea(course.code));
  if (selectedValue.length) {
    defaultOptions = defaultOptions.filter(
      (course) => courseAreas.includes(getCourseArea(course.code)) && !selectedValue.includes(course)
    );
  }

  const search = (query: string) => {
    query = query.trim();

    if (query.length === 0) {
      setOptions(defaultOptions);
      return defaultOptions;
    }

    const newOptions = fuzzy.search(query).map((result) => result.item);

    // sorting results
    if (isSortAlphabetic) {
      let lengthQuery = query.length;
      if (lengthQuery <= 8) {
        newOptions.sort((a, b) =>
          a.code.substring(0, lengthQuery) === query.toUpperCase() &&
          b.code.substring(0, lengthQuery) === query.toUpperCase() &&
          a.code < b.code
            ? -1
            : 1
        );
      }
    }

    setOptions(newOptions);
    return newOptions;
  };

  const onChange = (_: any, value: any) => {
    const before = selectedCourses;
    const after = value;

    // find what was added/removed in the update
    const added = diffCourses(before, after);

    // return before the input value and options are reset
    if (added.length === 0) return;

    if (searchTimer.current) {
      // run a search now and cancel the current search timer
      const newOptions = search(inputValue);
      clearInterval(searchTimer.current);
      searchTimer.current = undefined;

      // revert back to the original value by removing what was added
      const originalValue = value.filter((course: CourseOverview) => !added.includes(course));

      // we need to add something, and our best guess is the top
      // result of the new search
      const newSelectedOption = newOptions[0];

      if (newSelectedOption && !selectedValue.includes(newSelectedOption)) {
        // otherwise, add the new option and call the handler
        setSelectedValue([...originalValue, newSelectedOption]);
        handleSelect(newSelectedOption.code);
      } else {
        // just revert it back without adding anything
        setSelectedValue(originalValue);
        // return before the input value and options are reset
        return;
      }
    } else {
      handleSelect(added.map((course) => course.code));
      setSelectedValue([...selectedValue, ...(added as CourseOverview[])]);
    }

    setOptions(defaultOptions);
    setInputValue('');
  };

  const fetchCoursesList = async () => {
    try {
      const fetchedCoursesList = await getCoursesList(year, term);
      setCoursesList(fetchedCoursesList.courses);
      checkExternallyAdded();
      fuzzy = new Fuse(fetchedCoursesList.courses, searchOptions);
      setLastUpdated(fetchedCoursesList.lastUpdated);
    } catch (e) {
      if (e instanceof NetworkError) {
        setErrorMsg(e.message);
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
        multiple
        // autoHighlight
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
        getOptionSelected={(option, value) => option.code === value.code}
        renderOption={(option) => (
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
