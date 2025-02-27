import type { Theme as MuiTheme } from "@mui/material/styles"
import "@emotion/react"
import "@emotion/styled"
import "./typography"

export interface ColorGroup {
  main: string
  highlight: string
  contrastText: string
}

interface CustomTheme {
  oldBackgroundColor: string
  transitionDuration: string
  shadow: string
  colors: {
    mitRed: string
    silverGray: string
    brightRed: string
    black: string
    white: string
    darkGray2: string
    darkGray1: string
    silverGrayDark: string
    silverGrayLight: string
    lightGray2: string
    lightGray1: string
    darkPink: string
    pink: string
    lightPink: string
    darkPurple: string
    purple: string
    lightPurple: string
    darkBlue: string
    blue: string
    lightBlue: string
    darkGreen: string
    green: string
    lightGreen: string
    darkRed: string
    red: string
    lightRed: string
    orange: string
    yellow: string
  }
}

declare module "@mui/material/styles" {
  interface Theme {
    custom: CustomTheme
  }

  interface ThemeOptions {
    custom: CustomTheme
  }

  interface PaletteColor {
    active?: string
  }

  interface SimplePaletteColorOptions {
    active?: string
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsSizeOverrides {
    medium: false
  }
}

declare module "@mui/material/InputBase" {
  interface InputBasePropsSizeOverrides {
    hero: true
    small: false
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsSizeOverrides {
    large: true
    medium: true
    small: false
  }
}

declare module "@emotion/react" {
  export interface Theme extends MuiTheme {
    custom: CustomTheme
  }
}
