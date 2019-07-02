import React from 'react'
import './App.css'
import Select from 'react-select'
import { TimeTable } from './components/timetable'

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

  // React.useEffect(() => {
  //   setName(props.name)
  //   const listener = () => console.log('hai')
  //   window.addEventListener('click', listener)
  //   return () => {
  //     // unmount
  //     window.removeEventListener('click', listener)
  //   }
  // }, [props.name])

  const handleChange = (e: any) => {
    setValue(e)
  }

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
