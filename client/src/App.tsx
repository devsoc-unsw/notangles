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

  React.useEffect(() => {
     
    fetch('http://localhost:3000/api/terms/T3-2019/courses/COMP1511/')
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      console.log(JSON.stringify(myJson));
    }
    ).catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
  }, [])
 
  
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
