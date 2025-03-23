import React, { useState, useEffect } from "react";
import "./App.css";
import scroll from "./assets/scroll.png";
import medal from "./assets/medal.png";
import wine from "./assets/wine.png";
import food from "./assets/food.png";
import euphoria from "./assets/euphoria.png";

const ITEMS = ["S", "M", "W", "F"];
const ITEM_MAP = {
  S: scroll,
  M: medal,
  W: wine,
  F: food,
};

const getFeedback = (guess, actual) => {
  const correct = guess.filter((g, i) => g === actual[i]).length;
  const totalMatches = ITEMS.reduce((sum, x) => {
    const countGuess = guess.filter((g) => g === x).length;
    const countActual = actual.filter((a) => a === x).length;
    return sum + Math.min(countGuess, countActual);
  }, 0);
  const incorrect = totalMatches - correct;
  const unknown = 4 - totalMatches;
  return [correct, incorrect, unknown];
};

const prune = (candidates, guess, feedback) => {
  return candidates.filter(
    (c) => JSON.stringify(getFeedback(guess, c)) === JSON.stringify(feedback)
  );
};

const pickGuess = (candidates, attempt) => {
  if (attempt === 0) return ["S", "S", "M", "M"];
  const onlySM = candidates.find((c) => c.every((x) => x === "S" || x === "M"));
  if (onlySM) return onlySM;
  const wNotF = candidates.find((c) => c.includes("W") && !c.includes("F"));
  if (wNotF) return wNotF;
  return candidates[0];
};

export default function App() {
  const [candidates, setCandidates] = useState(
    ITEMS.flatMap((a) =>
      ITEMS.flatMap((b) =>
        ITEMS.flatMap((c) => ITEMS.map((d) => [a, b, c, d]))
      )
    )
  );
  const [attempt, setAttempt] = useState(0);
  const [lastGuess, setLastGuess] = useState([]);
  const [input, setInput] = useState({ correct: 0, incorrect: 0, unknown: 0 });
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (candidates.length === 1 || attempt >= 7) {
      setDone(true);
    } else {
      const nextGuess = pickGuess(candidates, attempt);
      setLastGuess(nextGuess);
    }
  }, [attempt, candidates]);

  const handleFeedback = (e) => {
    e.preventDefault();
    const fb = [
      parseInt(input.correct),
      parseInt(input.incorrect),
      parseInt(input.unknown),
    ];
    const newCandidates = prune(candidates, lastGuess, fb);
    setCandidates(newCandidates);
    setAttempt(attempt + 1);
  };

  const reset = () => {
    setCandidates(
      ITEMS.flatMap((a) =>
        ITEMS.flatMap((b) =>
          ITEMS.flatMap((c) => ITEMS.map((d) => [a, b, c, d]))
        )
      )
    );
    setAttempt(0);
    setLastGuess([]);
    setInput({ correct: 0, incorrect: 0, unknown: 0 });
    setDone(false);
  };

  return (
    <div className="app-container">
      <div className="card">
        <h2>Guild PQ Helper</h2>
        <div className="subtitle">
          <img src={euphoria} alt="euphoria" className="icon" />
          J Euphoria Gym!
          <img src={euphoria} alt="euphoria" className="icon" />
        </div>

        {done ? (
          <>
            <p className="info">
              {candidates.length === 1
                ? `Solution found in ${attempt} attempts:`
                : `Couldn't narrow down to 1 solution in 7 attempts.`}
            </p>
            <div className="guess-box">
              {candidates[0].map((item, i) => (
                <img key={i} src={ITEM_MAP[item]} alt={item} className="item-img" />
              ))}
            </div>
            <button className="btn reset" onClick={reset}>Reset</button>
          </>
        ) : (
          <>
            <p className="info">
              Attempt #{attempt + 1} of 7 — Remaining: {candidates.length}
            </p>
            <div className="guess-box">
              {lastGuess.map((item, i) => (
                <img key={i} src={ITEM_MAP[item]} alt={item} className="item-img" />
              ))}
            </div>
            <form onSubmit={handleFeedback} className="form">
              {['correct', 'incorrect', 'unknown'].map((key) => (
                <div key={key} className="form-row">
                  <label>{key}:</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={input[key]}
                    onChange={(e) => setInput({ ...input, [key]: e.target.value })}
                    required
                  />
                </div>
              ))}
              <button type="submit" className="btn">Submit Feedback</button>
            </form>
            <button onClick={reset} className="btn reset">Reset</button>
          </>
        )}

        <p className="footer">
          YerAWizard's Braindead tools inc.<br />
          Thanks to big brains Lily!
        </p>
      </div>
    </div>
  );
}
