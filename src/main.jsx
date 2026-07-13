import React from 'react'
import ReactDOM from 'react-dom/client'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import App from './App.jsx'

const theme = createTheme({
  primaryColor: 'indigo',
  fontFamily: "'Nunito', 'Pretendard', -apple-system, sans-serif",
  defaultRadius: 'md',
  shadows: {
    xs: '0 1px 4px rgba(99, 102, 241, 0.06)',
    sm: '0 2px 8px rgba(99, 102, 241, 0.08)',
    md: '0 2px 12px rgba(99, 102, 241, 0.08)',
    lg: '0 4px 20px rgba(99, 102, 241, 0.10)',
    xl: '0 8px 40px rgba(15, 23, 42, 0.12)',
  },
  components: {
    Button: { defaultProps: { radius: 'xl' } },
    TextInput: { defaultProps: { radius: 'md' } },
    Select: { defaultProps: { radius: 'md' } },
    Textarea: { defaultProps: { radius: 'md' } },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Notifications position="top-center" />
      <App />
    </MantineProvider>
  </React.StrictMode>,
)
