import { useState } from "react";
import { Button } from "./ui/button";
import RegistrationForm from "./RegistrationForm";

export function Home() {
  return (
    <div className="p-8 flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <CountButton />
      <RegistrationForm />
    </div>
  );
}

export const CountButton = () => {
  const [count, setCount] = useState(0);

  return (
    <Button onClick={() => setCount((c) => c + 1)} className="mt-4 w-[200px]">
      Clicked {count} times
    </Button>
  );
};
