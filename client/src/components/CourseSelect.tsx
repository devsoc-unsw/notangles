import React from 'react'
import { CourseOption } from '../App'
import { CoursesList } from '../interfaces/CourseOverview'
import { getCoursesList } from '../api/getCoursesList'
import { Autocomplete } from '@material-ui/lab'
import { TextField, Box } from '@material-ui/core'
import styled from 'styled-components'

const NUM_COURSE_OPTIONS = 10

const StyledSelect = styled(Box)`
  width: 100%;
  text-align: left;
`

interface CourseSelectProps {
  onChange(value: CourseOption): void
  isDarkMode: boolean
}

const CourseSelect: React.FC<CourseSelectProps> = ({ onChange, isDarkMode }) => {
  const [coursesList, setCoursesList] = React.useState<CoursesList>([])
  const [options, setOptions] = React.useState<CourseOption[]>([])
  const [inputValue, setInputValue] = React.useState<string>("")

  React.useEffect(() => {
    fetchClassesList()
  }, [])

  React.useEffect(() => {
    setOptions(courseSelectOptions.slice(0, NUM_COURSE_OPTIONS))
  }, [coursesList])

  const courseSelectOptions: CourseOption[] = coursesList.map(course => ({
    value: course.courseCode,
    label: `${course.courseCode} - ${course.name}`,
  }))

  const handleInputChange = (value: string) => {
    setOptions(x => courseSelectOptions.filter(x => x.label.toLowerCase().includes(value.toLocaleLowerCase())).slice(0, NUM_COURSE_OPTIONS))
  }

  const handleChange = (event: object, value: CourseOption | null) => {
    if (value) {
      onChange(value)
    }
    setOptions(courseSelectOptions.slice(0, NUM_COURSE_OPTIONS))
    setInputValue("")
  }

  const fetchClassesList = async () => {
    const coursesList = await getCoursesList('2020', 'T1')
    if (coursesList) {
      setCoursesList(coursesList)
    }
  }

  return (
    <StyledSelect>
      <Autocomplete
        id="combo-box-demo"
        options={options}
        getOptionLabel={(option) => option.label}
        onChange={handleChange}
        inputValue={inputValue}
        disableClearable
        renderInput={(params) =>
          <TextField
            onChange={(event) => {
              handleInputChange(event.target.value)
              setInputValue(event.target.value)
            }}
            {...params}
            label="Select a Course"
            variant="filled"
          />}
      />
    </StyledSelect>
  )

}

export default CourseSelect