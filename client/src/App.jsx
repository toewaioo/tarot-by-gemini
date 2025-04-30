import { useState } from "react";
import "./App.css";
import TarotCardLayout from "./TarotLayout";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="App">
        <TarotCardLayout />
      </div>
    </>
  );
}

export default App;
