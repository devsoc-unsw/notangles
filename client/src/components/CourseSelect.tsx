import React from 'react';
import Fuse from 'fuse.js';
import { Autocomplete } from '@material-ui/lab';
import {
  TextField,
  InputAdornment,
  Box,
  Chip,
} from '@material-ui/core';
import {
  CloseRounded,
  SearchRounded,
  AddRounded,
  CheckRounded,
} from '@material-ui/icons';
import styled, { css } from 'styled-components';
import { borderRadius } from '../constants/theme';
import { CoursesList, CourseOverview } from '../interfaces/CourseOverview';
import { CourseData } from '../interfaces/CourseData';
import getCoursesList from '../api/getCoursesList';

const searchDelay = 200

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

const StyledTextField = styled(TextField)`
  fieldset {
    border-radius: ${borderRadius}px;
    border-color: ${(props) => props.theme.palette.secondary.main} !important;
  }
`;

const StyledInputAdornment = styled(InputAdornment)`
  margin-left: 7px;
  color: ${(props) => props.theme.palette.secondary.main};
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
  const [searchTimer, setSearchTimer] = React.useState<number | undefined>(undefined);

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
    b.filter((courseCode: string) => (
      !a.includes(courseCode)
    )).forEach((courseCode: string) => {
      callback(courseCode);
    });
  };

  const onChange = (event: any, value: any) => {
    const before = getCourseCodes<CourseData>(selectedCourses);
    const after = getCourseCodes<CourseOverview>(value);
    diffCourseCodes(before, after, handleSelect);
    diffCourseCodes(after, before, handleRemove);

    setOptions(defaultOptions);
    setSelectedValue(value);
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
      setOptions(defaultOptions)
      return
    }

    clearTimeout(searchTimer)
    setSearchTimer(setTimeout(() => {
      setOptions(fuzzy.search(
        value,
      ).map(
        (result) => result.item,
      ).slice(
        0, searchOptions.limit,
      ));
    }, searchDelay))
  }, [inputValue])

  return (
    <StyledSelect>
      <Autocomplete
        multiple
        autoHighlight
        disableClearable
        filterSelectedOptions
        noOptionsText="No Results"
        selectOnFocus={false}
        options={options}
        onChange={onChange}
        inputValue={inputValue}
        filterOptions={(options) => options}

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
            placeholder={selectedValue.length ? 'Add more courses' : 'Select your courses'}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Backspace') {
                event.stopPropagation();
              }
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
