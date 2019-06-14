import React from 'react'
import './App.css'
import Select from 'react-select'
import { ValueType } from 'react-select/lib/types'

interface IOption {
  value: string
  label: string
}

const options: IOption[] = [
  { value: 'comp1511', label: 'COMP1511' },
  { value: 'comp2511', label: 'COMP2511' },
  { value: 'comp2411', label: 'COMP2411' },
]

const App = () => {
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
      <Select options={options} value={value} onChange={handleChange} />
      Selected course: {value ? value.label : 'No course selected'}
    </div>
  )
}

export default App
