import { useState } from "react";

function App() {
  const [question, setQuestion] = useState("What is your greatest strength?");
  const [showAnswer, setShowAnswer] = useState(false);
  const idealAnswer =
    "My greatest strength is my adaptability and problem-solving skills.";

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold">AI Interview Coach</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 mt-4 w-96 text-center">
        <p className="text-lg font-semibold">{question}</p>
        <button
          onClick={() => setShowAnswer(true)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Show Ideal Answer
        </button>
        {showAnswer && (
          <p className="mt-4 text-gray-700 border-t pt-2">{idealAnswer}</p>
        )}
      </div>
    </div>
  );
}

export default App;
