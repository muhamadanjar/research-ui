import { useRoutes } from 'react-router-dom'
import router from './router'

function App() {
  const content = useRoutes(router)
  return (
    <div className="App">
      {content}
    </div>
  )
}

export default App
