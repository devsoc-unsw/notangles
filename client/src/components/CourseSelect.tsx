import React from 'react'
import { CourseOption } from '../App'
import { CoursesList } from '../interfaces/CourseOverview'
import { getCoursesList } from '../api/getCoursesList'
import Select from 'react-select'
import styled from 'styled-components'

const StyledSelect = styled(Select)`
  width: 100%;
  text-align: left;
`
const NUM_COURSE_OPTIONS = 10

interface CourseSelectProps {
    onChange(course: CourseOption) : void
    isDarkMode : boolean
}

const CourseSelect: React.FC<CourseSelectProps> = ({onChange, isDarkMode}) => {
    const [coursesList, setCoursesList] = React.useState<CoursesList>([])
    const[options, setOptions] = React.useState<CourseOption[]>([])

    React.useEffect(() => {
        fetchClassesList()
      }, [])


    const courseSelectOptions = (coursesList : CoursesList) => {
      return coursesList.map(course => ({
        value: course.courseCode,
        label: `${course.courseCode} - ${course.name}`,
    }))
    }

    const handleChange = (inputValue: string) => {
        setOptions(x => courseSelectOptions(coursesList).filter(x => x.label.toLowerCase().includes(inputValue.toLocaleLowerCase())).slice(0,NUM_COURSE_OPTIONS))
    }

    const fetchClassesList = async () => {

      const coursesList = await getCoursesList('2020', 'T1')
      if(coursesList) {
        setCoursesList(coursesList)
        setOptions(courseSelectOptions(coursesList.slice(1,10)))
      }
    }

    return (
        <StyledSelect
            options={options}
            value={null}
            onInputChange={handleChange}
            onChange={onChange}
            placeholder="Select a Course"
            
            theme={(theme: any) => ({
              ...theme,
              borderRadius: 0,
              colors: {
              ...theme.colors,
                primary25: isDarkMode ? '#2684FF' : '#DEEBFF',
                neutral0: isDarkMode ? "#202020" : 'white',
                primary: isDarkMode ? "white" : '#2684FF'
              },
            })}
        />
    )

}

export default CourseSelect