import React from 'react';
import Fuse from 'fuse.js';
import { Autocomplete } from '@material-ui/lab';
import { TextField, Box, Chip } from '@material-ui/core';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import { CoursesList, CourseOverview } from '../interfaces/CourseOverview';
import { CourseData } from '../interfaces/CourseData';
import { borderRadius } from '../constants/theme'
import styled from 'styled-components';
import getCoursesList from '../api/getCoursesList';

interface SearchOptions {
  limit: number,
  threshold: number,
  keys: string[]
}

const searchOptions: SearchOptions = {
  limit: 6,
  threshold: 0.5,
  keys: ["courseCode", "name"]
}

let fuzzy = new Fuse<CourseOverview, SearchOptions>([], searchOptions)

const StyledSelect = styled(Box)`
  width: 100%;
  text-align: left;
`;

const StyledTextField = styled(TextField)`
  fieldset {
    border-radius: ${borderRadius}px;
  }
`

const StyledOption = styled.span`
  color: hsl(0, 0%, 60%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  & b {
    color: black;
    font-weight: normal;
  }
`

interface CourseSelectProps {
  selectedCourses: CourseData[]
  handleSelect(courseCode: string): void
  handleRemove(courseCode: string): void
}

const CourseSelect: React.FC<CourseSelectProps> = ({
  selectedCourses,
  handleSelect,
  handleRemove,
}) => {
  const [coursesList, setCoursesList] = React.useState<CoursesList>([]);
  const [options, setOptions] = React.useState<CoursesList>([]);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [selectedValue, setSelectedValue] = React.useState<CoursesList>([])

  let defaultOptions = coursesList

  // show relevant default options based of selected courses
  const getCourseArea = (courseCode: string) => courseCode.substring(0, 4)
  const courseAreas = selectedValue.map((course) => getCourseArea(course.courseCode))
  if (selectedValue.length) {
    defaultOptions = defaultOptions.filter((course) => (
      courseAreas.includes(getCourseArea(course.courseCode))
    ))
  }
  defaultOptions = defaultOptions.slice(0, searchOptions.limit)

  const onChange = (event: any, value: any) => {
    // diff added courses
    value.forEach((courseOverview: CourseOverview) => {
      const courseCode = courseOverview.courseCode
      if (selectedCourses.find((course: CourseData) => course.courseCode === courseCode) === undefined) {
        handleSelect(courseCode)
      }
    })

    // diff removed courses
    selectedCourses.forEach((courseData: CourseData) => {
      const courseCode = courseData.courseCode
      if (value.find((course: CourseOverview) => course.courseCode === courseCode) === undefined) {
        handleRemove(courseCode)
      }
    })

    setOptions(defaultOptions);
    setSelectedValue(value)
    setInputValue('');
  };

  const fetchCoursesList = async () => {
    const fetchedCoursesList = await getCoursesList('2020', 'T2');
    if (fetchedCoursesList) {
      setCoursesList(fetchedCoursesList);
      fuzzy = new Fuse(fetchedCoursesList, searchOptions)
    }
  };

  React.useEffect(() => {
    fetchCoursesList();
  }, []);

  React.useEffect(() => {
    setOptions(defaultOptions);
  }, [coursesList]);

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
        renderOption={(option) => (
          <StyledOption>
            <b>{option.courseCode}</b> {option.name}
          </StyledOption>
        )}
        onChange={onChange}
        inputValue={inputValue}
        filterOptions={(options, state) => {
          let value = state.inputValue
          if (value.length === 0) {
            return defaultOptions
          } else {
            return fuzzy.search(
              value
            ).map(
              (result) => result.item
            ).slice(
              0, searchOptions.limit
            )
          }
        }}
        renderInput={(params) => (
          <StyledTextField
            autoFocus
            variant="outlined"
            placeholder={selectedCourses.length ? "Add more courses" : "Select your courses"}
            onKeyDown={(event) => {
              if (event.key === "Backspace") {
                event.stopPropagation()
              }
            }}
            onChange={(event) => setInputValue(event.target.value)}
            {...params}
          />
        )}
        renderTags={(value: CoursesList, getTagProps) =>
          value.map((option: CourseOverview, index: number) => (
            <Chip
              label={option.courseCode}
              variant="outlined"
              // color="primary"
              // style={{color: "#00796b"}}
              deleteIcon={<CloseRoundedIcon />}
              {...getTagProps({ index })}
            />
          ))
        }
      />
    </StyledSelect>
  );
};

export default CourseSelect;
