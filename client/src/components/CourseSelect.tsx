import React from 'react';
import Fuse from 'fuse.js';
import { Autocomplete } from '@material-ui/lab';
import {
  TextField,
  InputAdornment,
  Box,
  Chip,
  Theme,
} from '@material-ui/core';
import {
  CloseRounded,
  SearchRounded,
  AddRounded,
  CheckRounded,
} from '@material-ui/icons';
import styled, { css } from 'styled-components';
import { CoursesList, CourseOverview } from '../interfaces/CourseOverview';
import { CourseData } from '../interfaces/CourseData';
import getCoursesList from '../api/getCoursesList';

const SEARCH_DELAY = 300;

interface SearchOptions {
  limit: number
  threshold: number
  keys: {
    name: string
    weight: number
  }[]
}

const searchOptions: SearchOptions = {
  limit: 6,
  threshold: 0.4,
  keys: [
    {
      name: 'courseCode',
      weight: 0.9,
    },
    {
      name: 'name',
      weight: 0.1,
    },
  ],
};

let fuzzy = new Fuse<CourseOverview, SearchOptions>([], searchOptions);

const StyledSelect = styled(Box)`
  width: 100%;
  text-align: left;
`;

const StyledTextField = styled(TextField)<{
  theme: Theme
}>`
  .MuiOutlinedInput-root {
    fieldset {
      border-color: ${(props) => props.theme.palette.secondary.main};
      transition: border-color 100ms;
    }
    &:hover fieldset {
      border-color: ${(props) => props.theme.palette.secondary.dark};
    }
    &.Mui-focused fieldset {
      border-color: ${(props) => props.theme.palette.secondary.dark};
    }
  }

  label {
    color: ${(props) => props.theme.palette.secondary.dark} !important;
    transition: 200ms;
  }
`;

const StyledInputAdornment = styled(InputAdornment)`
  margin-left: 7px;
  color: ${(props) => props.theme.palette.secondary.dark};
`;

const StyledChip = styled(Chip).withConfig({
  shouldForwardProp: (prop) => !['backgroundColor'].includes(prop),
})<{
  backgroundColor: string
}>`
  transition: none;
  background-color: ${(props) => (
    props.backgroundColor
      ? props.backgroundColor
      : props.theme.palette.secondary.main
  )}
`;

const StyledOption = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
`;

const weakStyle = css`
  opacity: 0.6
`;

const StyledIcon = styled.span`
  position: relative;
  top: 3px;
  margin-right: 12px;
  ${weakStyle}
`;

const Weak = styled.span`
  margin-left: 7px;
  ${weakStyle}
`;

interface CourseSelectProps {
  selectedCourses: CourseData[]
  assignedColors: Record<string, string>
  handleSelect(courseCode: string): void
  handleRemove(courseCode: string): void
}

const CourseSelect: React.FC<CourseSelectProps> = ({
  selectedCourses,
  assignedColors,
  handleSelect,
  handleRemove,
}) => {
  const [coursesList, setCoursesList] = React.useState<CoursesList>([]);
  const [options, setOptions] = React.useState<CoursesList>([]);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [selectedValue, setSelectedValue] = React.useState<CoursesList>([]);
  const searchTimer = React.useRef<number | undefined>();

  let defaultOptions = coursesList;

  // show relevant default options based of selected courses
  const getCourseArea = (courseCode: string) => courseCode.substring(0, 4);
  const courseAreas = selectedValue.map((course) => getCourseArea(course.courseCode));
  if (selectedValue.length) {
    defaultOptions = defaultOptions.filter((course) => (
      courseAreas.includes(getCourseArea(course.courseCode))
      && !selectedValue.includes(course)
    ));
  }
  defaultOptions = defaultOptions.slice(0, searchOptions.limit);

  // maps a list of courses to a list of course codes
  const getCourseCodes = <Course extends {
    courseCode: string
  }>(courses: Course[]): string[] => (
      courses.map((course: Course) => course.courseCode)
    );

  // calls the callback for every course code in `b` that is not in `a`
  const diffCourseCodes = (a: string[], b: string[], callback: (courseCode: string) => void) => {
    let didCall = false;
    b.filter((courseCode: string) => (
      !a.includes(courseCode)
    )).forEach((courseCode: string) => {
      callback(courseCode);
      didCall = true;
    });
    return didCall;
  };

  const search = (query: string) => {
    const newOptions = fuzzy.search(
      query,
    ).map(
      (result) => result.item,
    ).slice(
      0, searchOptions.limit,
    );
    setOptions(newOptions);
    return newOptions;
  };

  const onChange = (event: any, value: any) => {
    const before = getCourseCodes<CourseData>(selectedCourses);
    const after = getCourseCodes<CourseOverview>(value);

    if (searchTimer.current) {
      // cancel whatever was added because new search results are pending

      // run a search now and cancel the current search timer
      const newOptions = search(inputValue);
      clearInterval(searchTimer.current);
      searchTimer.current = undefined;

      // we need to add something, and our best guess is the top
      // result of the new search
      const newSelectedOption = newOptions[0];

      // find what was added/removed in the update
      const added: string[] = [];
      const removed: string[] = [];
      diffCourseCodes(before, after, (courseCode: string) => {
        added.push(courseCode);
      });
      diffCourseCodes(after, before, (courseCode: string) => {
        removed.push(courseCode);
      });

      // only interfere if something was removed
      if (removed.length === 0) {
        // revert back to the original value by removing what was added
        const originalValue = value.filter((course: CourseOverview) => (
          !added.includes(course.courseCode)
        ));

        // check if the new option is a duplicate
        if (selectedValue.includes(newSelectedOption)) {
          // just revert it back without adding anything
          setSelectedValue(originalValue);
          // return before the input value and options are reset
          return;
        }
        // otherwise, add the new option and call the handler
        setSelectedValue([...originalValue, newSelectedOption]);
        handleSelect(newSelectedOption.courseCode);
      } else {
        setSelectedValue(value);
        removed.forEach((courseCode: string) => handleRemove(courseCode));
        // return before the input value and options are reset
        return;
      }
    } else {
      diffCourseCodes(before, after, handleSelect);
      const didRemove = diffCourseCodes(after, before, handleRemove);

      setSelectedValue(value);

      if (didRemove) {
        // return before the input value and options are reset
        return;
      }
    }

    setOptions(defaultOptions);
    setInputValue('');
  };

  const fetchCoursesList = async () => {
    const fetchedCoursesList = await getCoursesList('2020', 'T2');
    if (fetchedCoursesList) {
      setCoursesList(fetchedCoursesList);
      fuzzy = new Fuse(fetchedCoursesList, searchOptions);
    }
  };

  React.useEffect(() => {
    fetchCoursesList();
  }, []);

  React.useEffect(() => {
    setOptions(defaultOptions);
  }, [coursesList]);

  React.useEffect(() => {
    const value = inputValue.trim();

    if (value.length === 0) {
      setOptions(defaultOptions);
      return;
    }

    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      search(value);
      searchTimer.current = undefined;
    }, SEARCH_DELAY);
  }, [inputValue]);

  const shrinkLabel = inputValue.length > 0 || selectedValue.length > 0;

  return (
    <StyledSelect>
      <Autocomplete
        multiple
        autoHighlight
        disableClearable
        noOptionsText="No Results"
        selectOnFocus={false}
        options={options}
        value={selectedValue}
        onChange={onChange}
        inputValue={inputValue}
        // prevent built-in option filtering
        filterOptions={(o) => o}

        renderOption={(option) => (
          <StyledOption>
            <StyledIcon>
              {
                selectedValue.find((course: CourseOverview) => (
                  course.courseCode === option.courseCode
                )) ? <CheckRounded /> : <AddRounded />
              }
            </StyledIcon>
            <span>{option.courseCode}</span>
            <Weak>{option.name}</Weak>
          </StyledOption>
        )}

        renderInput={(params) => (
          <StyledTextField
            {...params}
            autoFocus
            variant="outlined"
            label="Select your courses"
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

        renderTags={(value: CoursesList, getTagProps) => (
          value.map((option: CourseOverview, index: number) => (
            <StyledChip
              label={option.courseCode}
              color="primary"
              backgroundColor={assignedColors[option.courseCode]}
              deleteIcon={<CloseRounded />}
              {...getTagProps({ index })}
            />
          ))
        )}
      />
    </StyledSelect>
  );
};

export default CourseSelect;
