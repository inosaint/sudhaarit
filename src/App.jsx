import { useEffect, useState } from "react";
import {
  CONSONANTS,
  VOWELS,
  kannadaToLatinTransliterate,
  latinToKannadaTransliterate,
} from "./transliteration.js";

const directionTabs = [
  { id: "latin-to-kannada", label: "English to Konkani" },
  { id: "kannada-to-latin", label: "Konkani to English" },
];

const examples = {
  "latin-to-kannada": ["kaso asai", "boro dis", "dev borem karoon", "jevan", "udak"],
  "kannada-to-latin": ["ಕಸೊ ಅಸೈ", "ಬೊರೊ ದೀಸ್", "ದೇವ್ ಬೊರೆಂ ಕರುಂ", "ಜೆವಂ", "ಉದಕ್"],
};

export default function App() {
  const [inputText, setInputText] = useState("");
  const [direction, setDirection] = useState("latin-to-kannada");
  const [showChart, setShowChart] = useState(false);
  const [mode, setMode] = useState("dark");
  const [copied, setCopied] = useState(false);

  const output = direction === "latin-to-kannada"
    ? latinToKannadaTransliterate(inputText)
    : kannadaToLatinTransliterate(inputText);

  const handleDirectionChange = (nextDirection) => {
    if (nextDirection === direction) return;
    setDirection(nextDirection);
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

  const inputLabel = direction === "latin-to-kannada"
    ? "Type in English (Latin)"
    : "Type in Konkani";
  const outputLabel = direction === "latin-to-kannada"
    ? "Konkani Output"
    : "English (Latin) Output";

  useEffect(() => {
    if (!showChart) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowChart(false);
      }
    };

    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showChart]);

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
            <span aria-hidden="true">{mode === "dark" ? "☀︎" : "☾"}</span>
          </button>

          <p className="system-label">Sudhaarit Phonetic System</p>
          <h1 id="page-title">ಕೊಂಕಣಿ ⇄ English</h1>
          <p className="lede">Konkani Kannada-script transliteration for quick drafting in either direction.</p>
        </header>

        <div className="transliteration-toolbar">
          <nav className="tabs" aria-label="Transliteration direction" role="tablist">
            {directionTabs.map((tab) => {
              const isActive = direction === tab.id;
              return (
                <button
                  className="tab-button"
                  id={`${tab.id}-tab`}
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="transliterate-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => handleDirectionChange(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <button
            className="toolbar-button"
            type="button"
            onClick={() => setShowChart(true)}
            aria-expanded={showChart}
            aria-controls="phonetic-chart"
          >
            Show Phonetic Alphabet
          </button>
        </div>

        <section
          className="panel"
          id="transliterate-panel"
          role="tabpanel"
          aria-labelledby={`${direction}-tab`}
        >
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
          </div>

          <div className="output-shell">
            <output
              className="output-box"
              aria-labelledby="output-label"
              aria-live="polite"
            >
              {output || <span className="placeholder">Translation will appear here...</span>}
            </output>
            <button
              className="small-button output-copy"
              type="button"
              onClick={handleCopy}
              disabled={!output}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

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
        </section>

        <footer className="footer-note">
          Based on Sudhaarit · Kanara (Kannada) Konkani Phonetic System · Mangalorean Catholic Dialect
        </footer>
      </section>

      {showChart && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setShowChart(false)}
          role="presentation"
        >
          <section
            className="chart modal"
            id="phonetic-chart"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chart-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <p className="system-label">Reference</p>
                <h2 id="chart-title">Phonetic Chart</h2>
              </div>
              <button
                className="icon-button modal-close"
                type="button"
                onClick={() => setShowChart(false)}
                aria-label="Close phonetic chart"
              >
                <span aria-hidden="true">×</span>
              </button>
            </header>

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
        </div>
      )}
    </main>
  );
}
