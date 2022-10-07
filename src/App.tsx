import { Box, Container } from '@mui/material'
import { useRoutes } from 'react-router-dom'
import router from './router'

function App() {
  const content = useRoutes(router)
  return (
    <Box>
      {content}
    </Box>
  )
}

export default App
