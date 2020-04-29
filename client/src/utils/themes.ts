import { createMuiTheme } from '@material-ui/core'

export const darkTheme = createMuiTheme({
    palette: {
      type: 'dark',
      secondary: {
        main: "rgba(255, 255, 255, 0.2)"
      },
      primary: {
        main: "#202020"
      },
      action: {
        disabled: "rgba(255, 255, 255, 0.5)"
      }
    },
  })
  
export const lightTheme = createMuiTheme({
    palette: {
      secondary: {
        main: "rgba(0, 0, 0, 0.2)"
      },
      primary: {
        main: "#FFF"
      },
      action: {
        disabled: "rgba(255, 255, 255, 0.5)"
      }
    }
  })