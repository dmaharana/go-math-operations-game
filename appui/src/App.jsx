import { useState } from 'react'
import MathOperationsGame from './components/MathOperationsGame.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
	  <MathOperationsGame />
    </>
  )
}

export default App
