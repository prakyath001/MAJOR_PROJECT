import React, { useState } from "react";
import "./App.css"; // custom styling

function App() {
  const fields = [
    "ER status measured by IHC",
    "3-Gene classifier subtype",
    "Pam50 + Claudin-low subtype",
    "PR Status",
    "Nottingham prognostic index",
    "Tumor Size",
    "HER2 Status",
  ];

  const [form, setForm] = useState(
    Object.fromEntries(fields.map((f) => [f, ""]))
  );

  const [prediction, setPrediction] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [suggestion, setSuggestion] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setPrediction(data.prediction);
      handleExplain(data.prediction);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExplain = async (predValue) => {
    try {
      const reqBody = { ...form, prediction: predValue };

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

        <h2 className="title">Breast Cancer Prediction</h2>

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

        <div className="btn-row">
          <button className="btn predict-btn" onClick={handlePredict}>
            Predict
          </button>
          <button
            className="btn explain-btn"
            onClick={() => handleExplain(prediction)}
          >
            Explain
          </button>
        </div>

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
