const Analysis = ({ analysisText }) => {
  return (
    <div className="futuristic-card p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4 futuristic-text">Analysis</h2>
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300 whitespace-pre-line">{analysisText}</p>
      </div>
    </div>
  )
}

export default Analysis

