export const style = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  fg: n => `\x1b[38;5;${n}m`,
  bg: n => `\x1b[48;5;${n}m`
}

export const colors = {
  success: 35,
  error: 203,
  text: 245,
  highlight: 7,
  warning: 214,
  info: 39
}
