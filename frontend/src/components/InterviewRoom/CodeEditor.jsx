import { Editor } from "@monaco-editor/react";
import { Code, Play } from "lucide-react";
import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { executeCode } from "../../api/api";

function CodeEditor({codeValue, setCodeValue, output, setOutput, handleCodeSubmit}) {
  const location = useLocation();

  const editorRef = useRef();

  const [language, setLanguage] = useState(
    location.state?.jobData.languages[0] || "javascript",
  );

  const languages = location.state?.jobData.languages || ["javascript"];

  const [toggleEditor, setToggleEditor] = useState(true);

  const onMount = (editor) => {
    editorRef.current = editor;
  };

  
  const onLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      const result = await executeCode(language, sourceCode);
      setOutput(result.run.output);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="drawer">
      <input id="my-drawer-1" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Page content here */}
        <label htmlFor="my-drawer-1" className="btn drawer-button">
          <Code />
          Code
        </label>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-1"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-none min-h-full">
          <div className="h-[5vh] w-[60vw] bg-base-200 flex justify-end gap-2">
            <button
              className="btn btn-warning"
              onClick={() => runCode(language, codeValue)}
            >
              <Play /> Run
            </button>
            <button className="btn btn-success" onClick={handleCodeSubmit}>
              Submit
            </button>
          </div>
          <div className="h-[5vh] w-[60vw] bg-base-200 flex justify-between">
            <div className="join">
              <button
                className="btn btn-soft join-item"
                onClick={() => {
                  setToggleEditor((prev) => !prev);
                }}
                disabled={toggleEditor}
              >
                Editor
              </button>
              <button
                className="btn btn-soft join-item"
                onClick={() => {
                  setToggleEditor((prev) => !prev);
                }}
                disabled={!toggleEditor}
              >
                Output
              </button>
            </div>
            <div>
              <select
                defaultValue={language}
                className="select select-secondary"
                onChange={(e) => onLanguageChange(e)}
              >
                {languages.map((lang, i) => (
                  <option disabled={lang === language} key={i}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {toggleEditor === true ? (
            <Editor
              height="90vh"
              width="60vw"
              onMount={onMount}
              theme="vs-dark"
              defaultLanguage={language}
              language={language}
              defaultValue=""
              value={codeValue}
              onChange={(value) => setCodeValue(value)}
            />
          ) : (
            <div className="h-[90vh] w-[60vw] bg-base-100">
              <div className="m-2">
                <h1 className="text-2xl font-work-sans">Output</h1>
                <div className="divider"></div>
                <div>
                  <p>{output}</p>
                </div>
              </div>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}

export default CodeEditor;
