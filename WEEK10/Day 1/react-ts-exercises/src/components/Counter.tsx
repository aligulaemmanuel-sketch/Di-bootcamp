// Exercise 3: useState with explicit TypeScript types.
import { useState } from 'react'

type Action = 'increment' | 'decrement' | null

function Counter() {
  const [count, setCount] = useState<number>(0)
  const [lastAction, setLastAction] = useState<Action>(null)

  const increment = (): void => {
    setCount((prev) => prev + 1)
    setLastAction('increment')
  }

  const decrement = (): void => {
    setCount((prev) => prev - 1)
    setLastAction('decrement')
  }

  return (
    <div className="card">
      <h3>Count: {count}</h3>
      <div className="row">
        <button type="button" onClick={decrement}>
          − Decrement
        </button>
        <button type="button" onClick={increment}>
          + Increment
        </button>
      </div>
      <p>Last action: {lastAction ?? 'none yet'}</p>
    </div>
  )
}

export default Counter
