import { useState } from 'react'

export default function QuizCard({ prompt, choices, answerIndex, onComplete }) {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleAnswerSelect = (index) => {
    if (isAnswered) return
    
    setSelectedIndex(index)
    setIsAnswered(true)
    
    const correct = index === answerIndex
    setIsCorrect(correct)
    
    if (correct) {
      onComplete?.(true)
    }
  }

  const forceNext = () => {
    onComplete?.(false)
  }

  const getChoiceStyle = (index) => {
    if (!isAnswered) {
      return selectedIndex === index 
        ? 'bg-blue-600/20 border-blue-500 text-blue-200 hover:bg-blue-600/30' 
        : 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500'
    }
    
    if (index === answerIndex) {
      return 'bg-green-600/20 border-green-500 text-green-200'
    }
    
    if (index === selectedIndex && !isCorrect) {
      return 'bg-red-600/20 border-red-500 text-red-200'
    }
    
    return 'bg-gray-800 border-gray-600 text-gray-400'
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-6">{prompt}</h3>
        
        <div className="space-y-4">
          {choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`w-full p-6 text-left border-2 rounded-xl transition-all cursor-pointer disabled:cursor-default ${getChoiceStyle(index)}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedIndex === index 
                    ? 'border-blue-400 bg-blue-400' 
                    : 'border-gray-500'
                }`}>
                  {selectedIndex === index && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="font-medium text-lg">{choice}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {isAnswered && (
        <div className="mb-6">
          {isCorrect ? (
            <div className="p-6 bg-green-600/20 border border-green-500 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-green-200 font-semibold text-lg">Correct! Well done.</span>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-red-600/20 border border-red-500 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-red-200 font-semibold text-lg">Incorrect. The correct answer is highlighted in green.</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        {!isCorrect && isAnswered && (
          <button
            onClick={forceNext}
            className="btn-primary bg-yellow-600 hover:bg-yellow-700"
          >
            Continue Anyway
          </button>
        )}
      </div>
    </div>
  )
}
