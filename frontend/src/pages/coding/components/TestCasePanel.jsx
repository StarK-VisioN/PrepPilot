import { LuCheck, LuX, LuCircleAlert, LuEyeOff } from "react-icons/lu";



function formatValue(value) {

  if (value === undefined) return "—";

  if (typeof value === "object") return JSON.stringify(value);

  return String(value);

}



const TestCasePanel = ({ testCases = [], runResult, loading, mode = "run" }) => {

  const results = runResult?.results || [];

  const executionMode = runResult?.mode || mode;



  return (

    <div className="space-y-4">

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h3 className="text-sm font-semibold text-gray-900">Test Results</h3>

          <p className="text-xs text-gray-500 mt-0.5">

            {executionMode === "submit"

              ? "Submit: visible + hidden + edge + stress tests"

              : "Run Code: visible examples only"}

          </p>

        </div>

        {runResult && (

          <span className="text-xs text-gray-500 shrink-0">

            {runResult.passedCount}/{runResult.totalCount} passed

          </span>

        )}

      </div>



      {loading && (

        <div className="text-sm text-gray-500 py-4 text-center">Running tests...</div>

      )}



      {!loading && !runResult && testCases.length > 0 && (

        <div className="space-y-2">

          {testCases.map((tc, i) => (

            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">

              <p className="font-medium text-gray-800 mb-1">{tc.label || `Case ${i + 1}`}</p>

              <p className="text-gray-600">

                <span className="font-medium">Input: </span>

                <code>{formatValue(tc.input)}</code>

              </p>

              <p className="text-gray-600">

                <span className="font-medium">Expected: </span>

                <code>{formatValue(tc.expected)}</code>

              </p>

            </div>

          ))}

        </div>

      )}



      {!loading && runResult && (

        <div className="space-y-2 max-h-64 overflow-y-auto">

          {results.map((result, i) => (

            <div

              key={i}

              className={`border rounded-lg p-3 text-sm ${

                result.passed

                  ? "bg-emerald-50 border-emerald-200"

                  : "bg-rose-50 border-rose-200"

              }`}

            >

              <div className="flex items-center gap-2 mb-2">

                {result.passed ? (

                  <LuCheck size={16} className="text-emerald-600" />

                ) : result.error ? (

                  <LuCircleAlert size={16} className="text-amber-600" />

                ) : (

                  <LuX size={16} className="text-rose-600" />

                )}

                <span className="font-medium text-gray-800">

                  {result.label || (result.isHidden ? "Hidden test" : `Case ${i + 1}`)}

                </span>

                {result.isHidden && (

                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">

                    <LuEyeOff size={12} />

                    Hidden

                  </span>

                )}

                <span className="text-xs text-gray-500 ml-auto">{result.runtimeMs}ms</span>

              </div>



              {result.isHidden ? (

                <p className="text-gray-600 text-xs">

                  {result.passed ? "Passed" : "Failed"}

                  {!result.passed && result.actual !== undefined && result.actual !== null && (

                    <span className="ml-2">

                      (your output: <code>{formatValue(result.actual)}</code>)

                    </span>

                  )}

                </p>

              ) : (

                <>

                  {result.input !== undefined && (

                    <p className="text-gray-600 mb-1">

                      <span className="font-medium">Input: </span>

                      <code>{formatValue(result.input)}</code>

                    </p>

                  )}

                  {result.expected !== undefined && (

                    <p className="text-gray-600 mb-1">

                      <span className="font-medium">Expected: </span>

                      <code>{formatValue(result.expected)}</code>

                    </p>

                  )}

                  {result.actual !== undefined && result.actual !== null && (

                    <p className="text-gray-600 mb-1">

                      <span className="font-medium">Actual: </span>

                      <code>{formatValue(result.actual)}</code>

                    </p>

                  )}

                </>

              )}

              {result.error && (

                <p className="text-rose-700 text-xs mt-1">{result.error}</p>

              )}

            </div>

          ))}

        </div>

      )}

    </div>

  );

};



export default TestCasePanel;

