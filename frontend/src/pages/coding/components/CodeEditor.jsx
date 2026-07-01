import Editor from "@monaco-editor/react";

import { LuRotateCcw } from "react-icons/lu";



const CodeEditor = ({

  code,

  onChange,

  onReset,

  readOnly = false,

}) => {

  return (

    <div className="flex flex-col h-full min-h-[280px] border border-gray-200 rounded-xl overflow-hidden bg-[#1e1e1e]">

      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-[#2d2d2d] border-b border-gray-700 flex-wrap">

        <div className="flex flex-col gap-0.5 min-w-0">

          <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">

            JavaScript

          </span>

          <span className="text-[11px] text-gray-500">

            JavaScript is supported in this version.

          </span>

        </div>

        {onReset && (

          <button

            type="button"

            onClick={onReset}

            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors shrink-0"

          >

            <LuRotateCcw size={14} />

            Reset

          </button>

        )}

      </div>

      <div className="flex-1 min-h-0">

        <Editor

          height="100%"

          language="javascript"

          value={code}

          onChange={(value) => onChange(value || "")}

          theme="vs-dark"

          options={{

            minimap: { enabled: false },

            fontSize: 14,

            lineNumbers: "on",

            scrollBeyondLastLine: false,

            automaticLayout: true,

            readOnly,

            tabSize: 2,

            wordWrap: "on",

          }}

        />

      </div>

    </div>

  );

};



export default CodeEditor;

