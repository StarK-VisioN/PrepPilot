const ProblemStatement = ({ challenge }) => {
  if (!challenge) return null;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{challenge.title}</h1>
        <div className="flex flex-wrap gap-2">
          {challenge.tags?.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
        {challenge.description}
      </div>

      {challenge.examples?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Examples</h3>
          <div className="space-y-4">
            {challenge.examples.map((ex, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
                <p className="mb-2">
                  <span className="font-medium text-gray-800">Input: </span>
                  <code className="text-orange-700">{ex.input}</code>
                </p>
                <p className="mb-2">
                  <span className="font-medium text-gray-800">Output: </span>
                  <code className="text-emerald-700">{ex.output}</code>
                </p>
                {ex.explanation && (
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-800">Explanation: </span>
                    {ex.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {challenge.constraints?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Constraints</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {challenge.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProblemStatement;
