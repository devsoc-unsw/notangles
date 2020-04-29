import { createMuiTheme } from '@material-ui/core'

export const darkTheme = createMuiTheme({
    palette: {
      type: 'dark',
      secondary: {
        main: "#777" // borders
      },
      primary: {
        main: "#3a76f8" // Course Select underline and NavBar
      },
      action: {
        disabled: "rgba(255, 255, 255, 0.5)"
      }
    },
  })
  
export const lightTheme = createMuiTheme({
    palette: {
      secondary: {
        main: "#bbb" // borders
      },
      primary: {
        main: "#3a76f8" // Course Select underline and NavBar
      },
      action: {
        disabled: "rgba(255, 255, 255, 0.5)"
      }
    }
  })