import { useState } from 'react'
import { Button } from './ui/button'

/**
 * Small interactive counter used on the home page to verify client-side state.
 *
 * @function CountButton
 * @returns {React.JSX.Element} Counter button element.
 */
export const CountButton = () => {
  const [count, setCount] = useState(0)

  return (
    <Button onClick={() => setCount((c) => c + 1)} className="mt-4 w-[200px]">
      Clicked {count} times
    </Button>
  )
}
