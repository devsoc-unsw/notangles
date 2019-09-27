import React from 'react'
import Select from 'react-select'
import TimeTable from './components/timetable'

import './App.css'

interface IOption {
  value: string
  label: string
}

const options: IOption[] = [
  { value: 'comp1511', label: 'COMP1511' },
  { value: 'comp2511', label: 'COMP2511' },
  { value: 'comp2411', label: 'COMP2411' },
  { value: 'arts1234', label: 'ARTS1234' },
]

const App: React.FC = () => {
  const [value, setValue] = React.useState<IOption>()
  const handleChange = (e: any) => {
    setValue(e)
  }
  return (
    <div className="App">
      <h2>Notangles</h2>
      <Select options={options} value={value} onChange={handleChange} />
      Selected course: {value ? value.label : 'No course selected'}
      <TimeTable />
    </div>
  )
}

export default App
