import React from 'react'
import './App.css'
import Select from 'react-select'
import { TimeTable } from './components/timetable'
import { DragDropContext } from 'react-beautiful-dnd'

interface CourseOption {
  value: string
  label: string
}

const options: CourseOption[] = [
  { value: 'comp1511', label: 'COMP1511' },
  { value: 'comp2511', label: 'COMP2511' },
  { value: 'comp2411', label: 'COMP2411' },
  { value: 'arts1234', label: 'ARTS1234' },
]

const App: React.FC = () => {
  const [value, setValue] = React.useState<CourseOption>()
  const handleChange = (e: any) => {
    setValue(e)
  }

  fetch('/api/terms/T2-2019/courses/COMP1521/')
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      // Examine the text in the response
      response.json().then(function(data) {
        console.log(data);
      });
    }
  ).catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
  
  return (
    <div>
      <h2>Notangles</h2>
      <p />
      <Select options={options} value={value} onChange={handleChange} />
      <p />
      Selected course: {value ? value.label : 'No course selected'}
      <p />
      <TimeTable />
    </div>
  )
}

export default App
