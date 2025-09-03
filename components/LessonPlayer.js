import { useState, useEffect, useRef } from 'react'
import VideoPlayer from './VideoPlayer'
import CodeCell from './CodeCell'
import QuizCard from './QuizCard'
import Simulation from './Simulation'
import MLCell from './MLCell'
import ModalOverlay from './ModalOverlay'

export default function LessonPlayer() {
  const [lesson, setLesson] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayContent, setOverlayContent] = useState(null)
  const [overlayTitle, setOverlayTitle] = useState('')
  
  const videoPlayerRef = useRef(null)

  // Load lesson data and restore progress from localStorage
  useEffect(() => {
    loadLesson()
    restoreProgress()
  }, [])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (lesson.length > 0) {
      localStorage.setItem('interactiveEdu_progress', JSON.stringify({
        currentStep,
        completedSteps: Array.from(completedSteps)
      }))
    }
  }, [currentStep, completedSteps, lesson])

  const loadLesson = async () => {
    try {
      const response = await fetch('/lesson.json')
      const lessonData = await response.json()
      setLesson(lessonData)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load lesson:', error)
      setIsLoading(false)
    }
  }

  const restoreProgress = () => {
    try {
      const saved = localStorage.getItem('interactiveEdu_progress')
      if (saved) {
        const { currentStep: savedStep, completedSteps: savedCompleted } = JSON.parse(saved)
        // Guard against invalid saved step indices
        const safeStep = typeof savedStep === 'number' && savedStep >= 0 ? savedStep : 0
        setCurrentStep(safeStep)
        setCompletedSteps(new Set(savedCompleted))
      }
    } catch (error) {
      console.error('Failed to restore progress:', error)
    }
  }

  const resetProgress = () => {
    try {
      localStorage.removeItem('interactiveEdu_progress')
    } catch (e) {
      console.warn('Failed clearing progress from localStorage', e)
    }
    setCompletedSteps(new Set())
    setShowOverlay(false)
    setOverlayContent(null)
    setCurrentStep(0)

    // Seek and play from the first video start if available
    const firstVideoIndex = lesson.findIndex(step => step.type === 'video')
    if (firstVideoIndex !== -1 && videoPlayerRef.current) {
      const firstVideo = lesson[firstVideoIndex]
      videoPlayerRef.current.playFrom(firstVideo.start ?? 0)
    }
  }

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < lesson.length) {
      setCurrentStep(stepIndex)
      setShowOverlay(false)
      setOverlayContent(null)
    }
  }

  const goToNext = () => {
    if (currentStep < lesson.length - 1) {
      goToStep(currentStep + 1)
    }
  }

  const goToPrevious = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }

  const markStepCompleted = (stepIndex) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]))
  }

  const handleCheckpointReached = () => {
    console.log('Checkpoint reached for step:', currentStep)
    // Find the next exercise step after current video
    const nextStepIndex = currentStep + 1
    console.log('Looking for exercise at step:', nextStepIndex)
    console.log('Lesson length:', lesson.length)
    console.log('Next step type:', lesson[nextStepIndex]?.type)
    
    if (nextStepIndex < lesson.length && lesson[nextStepIndex].type === 'exercise') {
      const nextStep = lesson[nextStepIndex]
      console.log('Found exercise:', nextStep)
      setOverlayTitle(getExerciseTitle(nextStep))
      setOverlayContent(renderExercise(nextStep, nextStepIndex))
      setShowOverlay(true)
    } else {
      // If no next exercise, check if we're at the end of the lesson
      console.log('No exercise found after step', currentStep)
    }
  }

  const getExerciseTitle = (step) => {
    switch (step.mode) {
      case 'code': return 'Code Exercise'
      case 'quiz': return 'Quiz Question'
      case 'simulation': return 'Interactive Simulation'
      case 'ml': return 'Machine Learning Exercise'
      default: return 'Exercise'
    }
  }

  const renderExercise = (step, stepIndex) => {
    switch (step.mode) {
      case 'code':
        return (
          <CodeCell
            prompt={step.prompt}
            starterCode={step.starterCode}
            onComplete={() => handleExerciseComplete(stepIndex)}
          />
        )
      
      case 'quiz':
        return (
          <QuizCard
            prompt={step.prompt}
            choices={step.choices}
            answerIndex={step.answerIndex}
            onComplete={() => handleExerciseComplete(stepIndex)}
          />
        )
      
      case 'simulation':
        return (
          <Simulation
            prompt={step.prompt}
            config={step.config}
            onComplete={() => handleExerciseComplete(stepIndex)}
          />
        )
      
      case 'ml':
        return (
          <MLCell
            prompt={step.prompt}
            starterCode={step.starterCode}
            onComplete={() => handleExerciseComplete(stepIndex)}
          />
        )
      
      default:
        return <div>Unknown exercise type: {step.mode}</div>
    }
  }

  const handleExerciseComplete = (stepIndex) => {
    markStepCompleted(stepIndex)
    
    // Close overlay
    setShowOverlay(false)
    setOverlayContent(null)
    
    // Resume video or advance to next step
    if (videoPlayerRef.current) {
      // If there's a next video step, seek to it
      const nextStepIndex = stepIndex + 1
      if (nextStepIndex < lesson.length && lesson[nextStepIndex].type === 'video') {
        const nextVideoStep = lesson[nextStepIndex]
        videoPlayerRef.current.playFrom(nextVideoStep.start)
        setCurrentStep(nextStepIndex)
      } else {
        // Resume current video if no next video step
        videoPlayerRef.current.resume()
      }
    }
  }

  const handleOverlayClose = () => {
    setShowOverlay(false)
    setOverlayContent(null)
    
    // Resume video when overlay is closed
    if (videoPlayerRef.current) {
      videoPlayerRef.current.resume()
    }
  }

  const renderStep = (step, index) => {
    if (step.type === 'video') {
      return (
        <VideoPlayer
          key={index}
          ref={videoPlayerRef}
          videoId={step.videoId}
          start={step.start}
          end={step.end}
          onCheckpointReached={handleCheckpointReached}
        />
      )
    }

    // For non-video steps, render normally (fallback)
    return (
      <div key={index} className="text-center py-8">
        <p className="text-gray-600">This step type is not supported in overlay mode.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (lesson.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load lesson data</p>
        </div>
      </div>
    )
  }

  const currentStepData = lesson[currentStep]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">IE</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                InteractiveEdu
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                <span className="text-blue-400 font-mono">{currentStep + 1}</span>
                <span className="mx-2 text-gray-500">/</span>
                <span className="text-gray-400">{lesson.length}</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <button
                onClick={resetProgress}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200 transition-all"
                title="Reset progress and restart from the beginning"
              >
                Reset Progress
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Only Video Steps */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentStepData.type === 'video' ? (
          renderStep(currentStepData, currentStep)
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">Navigate to a video step to continue learning</p>
          </div>
        )}
      </main>

      {/* Exercise Overlay */}
      <ModalOverlay
        isOpen={showOverlay}
        onClose={handleOverlayClose}
        title={overlayTitle}
      >
        {overlayContent}
      </ModalOverlay>
    </div>
  )
}
