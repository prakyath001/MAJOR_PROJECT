import React, { useState } from "react";
import "./App.css"; // your custom styling

function App() {
  // Input fields
  const fields = [
    "ER status measured by IHC",
    "3-Gene classifier subtype",
    "Pam50 + Claudin-low subtype",
    "PR Status",
    "Nottingham prognostic index",
    "Tumor Size",
    "HER2 Status",
  ];

  // State
  const [form, setForm] = useState(Object.fromEntries(fields.map(f => [f, ""])));
  const [prediction, setPrediction] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [suggestion, setSuggestion] = useState(null);

  // Input change handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Predict API call
  const handlePredict = async () => {
    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setPrediction(data.prediction);

      // Clear previous explanation and suggestion
      setExplanation(null);
      setSuggestion(null);
    } catch (error) {
      console.error(error);
    }
  };

  // Explain API call
  const handleExplain = async () => {
    if (!prediction) return; // prevent explain if no prediction
    try {
      const reqBody = { ...form, prediction };
      const res = await fetch("http://localhost:8000/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      setExplanation(data.explanation);
      setSuggestion(data.suggestion);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2 className="title">Breast Cancer Risk Prediction</h2>

        {/* Input fields */}
        {fields.map((field) => (
          <div className="input-group" key={field}>
            <label>{field}</label>
            <input
              type="number"
              step="any"
              name={field}
              value={form[field]}
              onChange={handleChange}
            />
          </div>
        ))}

        {/* Buttons */}
        <div className="btn-row">
          <button className="btn predict-btn" onClick={handlePredict}>
            Predict
          </button>
          <button
            className="btn explain-btn"
            disabled={!prediction}
            onClick={handleExplain}
          >
            Explain
          </button>
        </div>

        {/* Prediction result */}
        {prediction !== null && (
          <div className="result-box">
            <h3>
              Prediction:{" "}
              <span className={prediction ? "high" : "low"}>
                {prediction ? "High Risk" : "Low Risk"}
              </span>
            </h3>
          </div>
        )}

        {/* Explanation result */}
        {explanation && (
          <div className="explain-box">
            <h4>Feature Contributions (SHAP)</h4>
            <ul>
              {Object.entries(explanation).map(([k, v]) => (
                <li key={k}>
                  <strong>{k}:</strong> {v.toFixed(4)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Suggestion */}
        {suggestion && (
          <div className="suggest-box">
            <h4>AI Suggestion</h4>
            <p>{suggestion}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
