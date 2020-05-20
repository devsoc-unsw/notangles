import React from 'react';
import Fuse from 'fuse.js';
import { Autocomplete } from '@material-ui/lab';
import { TextField, Box, Chip } from '@material-ui/core';
import { CoursesList, CourseOverview } from '../interfaces/CourseOverview';
import { CourseData } from '../interfaces/CourseData';
import styled from 'styled-components';
import getCoursesList from '../api/getCoursesList';

interface SearchOptions {
  limit: number,
  threshold: number,
  keys: string[]
}

const searchOptions: SearchOptions = {
  limit: 10,
  threshold: 0.5,
  keys: ["courseCode", "name"]
}

let fuzzy = new Fuse<CourseOverview, SearchOptions>([], searchOptions)

const StyledSelect = styled(Box)`
  width: 100%;
  text-align: left;
`;

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

  const defaultOptions = coursesList.slice(0, searchOptions.limit)

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
        id="course-select"
        multiple
        autoHighlight
        noOptionsText="No Results"
        options={options}
        getOptionLabel={(option) => `${option.courseCode} – ${option.name}`}
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
          <TextField
            {...params}
            onChange={(event) => {
              setInputValue(event.target.value)
              event.stopPropagation()
            }}
            placeholder={selectedValue.length ? "Add More Courses" : "Select Your Courses"}
            variant="outlined"
            autoFocus
          />
        )}
        renderTags={(value: CoursesList, getTagProps) =>
          value.map((option: CourseOverview, index: number) => (
            <Chip label={option.courseCode} variant="outlined" {...getTagProps({ index })} />
          ))
        }
      />
    </StyledSelect>
  );
};

export default CourseSelect;
