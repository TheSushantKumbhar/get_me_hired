import { Editor } from "@monaco-editor/react";
import { Code } from "lucide-react";

function CodeEditor() {
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
        <ul className="menu bg-base-200 min-h-full w-80 p-4">
          <div className="h-[5vh] w-[60vw] bg-base-200 flex justify-end">
            <button className="btn btn-success">Submit</button>
          </div>
          <Editor
            height="95vh"
            width="60vw"
            theme="vs-dark"
            defaultLanguage="javascript"
            defaultValue="// code here"
          />
        </ul>
      </div>
    </div>
  );
}

export default CodeEditor;
