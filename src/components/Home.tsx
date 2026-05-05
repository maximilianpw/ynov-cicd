import { useState } from "react";
import { Button } from "./ui/button";

export function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <CountButton />
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
    </div>
  );
}

export const CountButton = () => {
  const [count, setCount] = useState(0);

  return (
    <Button onClick={() => setCount((c) => c + 1)} className="mt-4">
      Clicked {count} times
    </Button>
  );
};
