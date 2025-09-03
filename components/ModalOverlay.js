import { useEffect, useState } from 'react'

export default function ModalOverlay({ isOpen, onClose, children, title }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsAnimating(true)
      // Prevent body scroll when overlay is open
      document.body.style.overflow = 'hidden'
    } else {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsAnimating(false)
        document.body.style.overflow = 'unset'
      }, 300) // Match transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-6xl max-h-[90vh] transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-6 -right-6 w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 z-10 border-2 border-gray-600"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Content */}
        <div className="exercise-container overflow-hidden max-h-[90vh]">
          {title && (
            <div className="exercise-header px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-white ml-4">{title}</h2>
              </div>
            </div>
          )}
          <div className="exercise-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
