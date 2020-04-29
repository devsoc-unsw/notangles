import React from 'react'
import { CourseOption } from '../App'
import { CoursesList } from '../interfaces/CourseOverview'
import { getCoursesList } from '../api/getCoursesList'
import { Autocomplete } from '@material-ui/lab'
import { TextField } from '@material-ui/core'

const NUM_COURSE_OPTIONS = 10

interface CourseSelectProps {
  onChange(event: object, value: any): void
  isDarkMode: boolean
}

const CourseSelect: React.FC<CourseSelectProps> = ({ onChange, isDarkMode }) => {
  const [coursesList, setCoursesList] = React.useState<CoursesList>([])
  const [options, setOptions] = React.useState<CourseOption[]>([])

  React.useEffect(() => {
    fetchClassesList()
  }, [coursesList])

  const courseSelectOptions: CourseOption[] = coursesList.map(course => ({
    value: course.courseCode,
    label: `${course.courseCode} - ${course.name}`,
  }))

  const handleChange = (event: object, inputValue: string) => {
    setOptions(x => courseSelectOptions.filter(x => x.label.toLowerCase().includes(inputValue.toLocaleLowerCase())).slice(0, NUM_COURSE_OPTIONS))
  }

  const fetchClassesList = async () => {
    const coursesList = await getCoursesList('2020', 'T1')
    if (coursesList) {
      setCoursesList(coursesList)
      if (options.length == 0) {
        setOptions(courseSelectOptions.slice(1, 10))
      }
    }
  }

  return (
    <Autocomplete
      id="combo-box-demo"
      options={options}
      getOptionLabel={(option) => option.label}
      style={{ width: '100%', textAlign : 'left' }}
      onChange = { onChange }
      onInputChange = { handleChange }
      renderInput={(params) => <TextField {...params} label="Select a Course" variant="outlined" />}
    />
  )

}

export default CourseSelect