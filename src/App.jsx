import { useMemo, useState } from "react";
import {
  CONSONANTS,
  TEST_WORDS,
  VOWELS,
  kannadaToLatinTransliterate,
  latinToKannadaTransliterate,
} from "./transliteration.js";

const tabs = [
  { id: "transliterate", label: "Transliterate" },
  { id: "test", label: "Test & Feedback" },
];

const examples = {
  "latin-to-kannada": ["kaso asai", "boro dis", "dev borem karoon", "jevan", "udak"],
  "kannada-to-latin": ["ಕಸೊ ಅಸೈ", "ಬೊರೊ ದೀಸ್", "ದೇವ್ ಬೊರೆಂ ಕರುಂ", "ಜೆವಂ", "ಉದಕ್"],
};

function getFeedbackSummary(feedback) {
  const correct = Object.values(feedback).filter((value) => value === "correct").length;
  const wrong = Object.values(feedback).filter((value) => value === "wrong").length;
  const total = TEST_WORDS.length;
  return { correct, wrong, pending: total - correct - wrong, total };
}

export default function App() {
  const [inputText, setInputText] = useState("");
  const [direction, setDirection] = useState("latin-to-kannada");
  const [showChart, setShowChart] = useState(false);
  const [mode, setMode] = useState("dark");
  const [copied, setCopied] = useState(false);
  const [feedbackCopied, setFeedbackCopied] = useState(false);
  const [feedback, setFeedback] = useState({});
  const [corrections, setCorrections] = useState({});
  const [activeTab, setActiveTab] = useState("transliterate");

  const output = direction === "latin-to-kannada"
    ? latinToKannadaTransliterate(inputText)
    : kannadaToLatinTransliterate(inputText);

  const summary = useMemo(() => getFeedbackSummary(feedback), [feedback]);
  const reviewedCount = summary.correct + summary.wrong;
  const reviewedPercent = (reviewedCount / summary.total) * 100;
  const correctPercent = (summary.correct / summary.total) * 100;

  const swapDirection = () => {
    setDirection((currentDirection) => (
      currentDirection === "latin-to-kannada" ? "kannada-to-latin" : "latin-to-kannada"
    ));
    setInputText(output);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = output;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleFeedback = (wordId, type) => {
    setFeedback((currentFeedback) => ({
      ...currentFeedback,
      [wordId]: currentFeedback[wordId] === type ? null : type,
    }));
    if (type === "correct") {
      setCorrections((currentCorrections) => {
        const nextCorrections = { ...currentCorrections };
        delete nextCorrections[wordId];
        return nextCorrections;
      });
    }
  };

  const handleCopyFeedback = async () => {
    const lines = TEST_WORDS.map((word) => {
      const got = latinToKannadaTransliterate(word.latin);
      const status = feedback[word.id] || "not reviewed";
      const correction = corrections[word.id] || "";
      return `${word.latin} -> ${got} | Expected: ${word.expectedKannada} | Status: ${status}${correction ? ` | Correction: ${correction}` : ""}`;
    });
    const text = [
      "Konkani Transliterator Feedback",
      "----------------------------------------",
      ...lines,
      "",
      `Summary: ${summary.correct} correct, ${summary.wrong} wrong, ${summary.pending} not reviewed`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setFeedbackCopied(true);
      window.setTimeout(() => setFeedbackCopied(false), 1500);
    } catch {
      setFeedbackCopied(false);
    }
  };

  const inputLabel = direction === "latin-to-kannada"
    ? "Type in English (Latin)"
    : "Type in Konkani";
  const outputLabel = direction === "latin-to-kannada"
    ? "Konkani Output"
    : "English (Latin) Output";

  return (
    <main className="app-shell" data-theme={mode}>
      <div className="page-grid" aria-hidden="true" />

      <section className="workspace" aria-labelledby="page-title">
        <header className="masthead">
          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={() => setMode((currentMode) => (currentMode === "dark" ? "light" : "dark"))}
            aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mode === "dark" ? "Light" : "Dark"}
          </button>

          <p className="system-label">Sudhaarit Phonetic System</p>
          <h1 id="page-title">ಕೊಂಕಣಿ ⇄ English</h1>
          <p className="lede">Konkani Kannada-script transliteration for quick drafting, review, and community feedback.</p>
        </header>

        <nav className="tabs" aria-label="Primary sections" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const label = tab.id === "test" && reviewedCount > 0
              ? `${tab.label} (${reviewedCount}/${summary.total})`
              : tab.label;
            return (
              <button
                className="tab-button"
                id={`${tab.id}-tab`}
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {activeTab === "transliterate" && (
          <section
            className="panel"
            id="transliterate-panel"
            role="tabpanel"
            aria-labelledby="transliterate-tab"
          >
            <div className="direction-control" aria-label="Transliteration direction">
              <span className={direction === "latin-to-kannada" ? "is-active" : ""}>English to Konkani</span>
              <button
                className="swap-button"
                type="button"
                onClick={swapDirection}
                aria-label="Swap transliteration direction"
              >
                <span aria-hidden="true">⇄</span>
              </button>
              <span className={direction === "kannada-to-latin" ? "is-active" : ""}>Konkani to English</span>
            </div>

            <div className="field-group">
              <label htmlFor="transliteration-input">{inputLabel}</label>
              <textarea
                id="transliteration-input"
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                placeholder={direction === "latin-to-kannada" ? "e.g., kaso asai?" : "e.g., ಕಸೊ ಅಸೈ?"}
                rows={5}
                spellCheck="false"
              />
            </div>

            <div className="output-header">
              <label id="output-label">{outputLabel}</label>
              <button
                className="small-button"
                type="button"
                onClick={handleCopy}
                disabled={!output}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <output
              className="output-box"
              aria-labelledby="output-label"
              aria-live="polite"
            >
              {output || <span className="placeholder">Translation will appear here...</span>}
            </output>

            <section className="examples" aria-labelledby="examples-title">
              <h2 id="examples-title">Try These</h2>
              <div className="chip-list">
                {examples[direction].map((example) => (
                  <button
                    className="chip"
                    key={example}
                    type="button"
                    onClick={() => setInputText(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </section>

            <button
              className="wide-button"
              type="button"
              onClick={() => setShowChart((current) => !current)}
              aria-expanded={showChart}
              aria-controls="phonetic-chart"
            >
              {showChart ? "Hide" : "Show"} Phonetic Chart
            </button>

            {showChart && (
              <section className="chart" id="phonetic-chart" aria-labelledby="chart-title">
                <h2 id="chart-title">Phonetic Chart</h2>
                {[
                  ["Vowels (Swaras)", VOWELS],
                  ["Consonants (Vyanjanas)", CONSONANTS],
                ].map(([title, list]) => (
                  <section className="chart-section" key={title} aria-labelledby={`chart-${title}`}>
                    <h3 id={`chart-${title}`}>{title}</h3>
                    <div className="chart-grid">
                      {list.map(([kannada, latin]) => (
                        <button
                          className="chart-tile"
                          key={kannada}
                          type="button"
                          onClick={() => setInputText((current) => (
                            current + (direction === "latin-to-kannada" ? latin.split("/")[0] : kannada)
                          ))}
                        >
                          <span className="chart-kannada">{kannada}</span>
                          <span className="chart-latin">{latin}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </section>
            )}
          </section>
        )}

        {activeTab === "test" && (
          <section
            className="panel"
            id="test-panel"
            role="tabpanel"
            aria-labelledby="test-tab"
          >
            <div className="feedback-intro">
              <p>
                Each item shows a word, the current transliterator output, and the expected Kannada form when one is known.
              </p>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Feedback reviewed"
                aria-valuemin="0"
                aria-valuemax={summary.total}
                aria-valuenow={reviewedCount}
              >
                <span
                  className="progress-fill"
                  style={{
                    "--correct-width": `${correctPercent}%`,
                    "--reviewed-width": `${reviewedPercent}%`,
                  }}
                />
              </div>
              <p className="progress-text">{reviewedCount}/{summary.total} reviewed</p>
            </div>

            <div className="test-list">
              {TEST_WORDS.map((word) => {
                const got = latinToKannadaTransliterate(word.latin);
                const status = feedback[word.id];

                return (
                  <article className="test-card" data-status={status || "pending"} key={word.id}>
                    <header className="word-header">
                      <div>
                        <h2>{word.latin}</h2>
                        <p>{word.meaning}</p>
                      </div>
                      <span className="category-pill">{word.category}</span>
                    </header>

                    <div className="comparison">
                      <div>
                        <p className="mini-label">Transliterator output</p>
                        <p className="script-output">{got}</p>
                      </div>
                      {word.expectedKannada !== "?" && (
                        <div>
                          <p className="mini-label">Expected</p>
                          <p className="script-output expected">{word.expectedKannada}</p>
                        </div>
                      )}
                    </div>

                    <div className="feedback-actions" aria-label={`Feedback for ${word.latin}`}>
                      <button
                        className="status-button"
                        type="button"
                        aria-pressed={status === "correct"}
                        onClick={() => handleFeedback(word.id, "correct")}
                      >
                        Correct
                      </button>
                      <button
                        className="status-button"
                        type="button"
                        aria-pressed={status === "wrong"}
                        onClick={() => handleFeedback(word.id, "wrong")}
                      >
                        Wrong
                      </button>
                      {word.needsReview && !status && (
                        <span className="review-note">Needs review</span>
                      )}
                    </div>

                    {status === "wrong" && (
                      <div className="field-group compact">
                        <label htmlFor={`correction-${word.id}`}>Correct Kannada spelling</label>
                        <input
                          id={`correction-${word.id}`}
                          type="text"
                          placeholder="Type the correct Kannada here..."
                          value={corrections[word.id] || ""}
                          onChange={(event) => {
                            setCorrections((current) => ({ ...current, [word.id]: event.target.value }));
                          }}
                        />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {reviewedCount > 0 && (
              <button className="wide-button" type="button" onClick={handleCopyFeedback}>
                {feedbackCopied ? "Feedback Copied" : "Copy Feedback Report"}
              </button>
            )}
          </section>
        )}

        <footer className="footer-note">
          Based on Sudhaarit · Kanara (Kannada) Konkani Phonetic System · Mangalorean Catholic Dialect
        </footer>
      </section>
    </main>
  );
}
