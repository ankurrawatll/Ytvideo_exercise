import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

const VideoPlayer = forwardRef(({ videoId, start, end, onCheckpointReached }, ref) => {
  const playerRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    playFrom: (newStart) => {
      if (playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(newStart)
        playerRef.current.playVideo()
        setIsPaused(false)
      }
    },
    resume: () => {
      if (playerRef.current && playerRef.current.playVideo) {
        playerRef.current.playVideo()
        setIsPaused(false)
      }
    },
    pause: () => {
      if (playerRef.current && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo()
        setIsPaused(true)
      }
    }
  }))

  useEffect(() => {
    // Initialize YouTube player when API is ready
    if (window.YT && window.YT.Player) {
      initializePlayer()
    } else {
      // Wait for YouTube API to load
      window.onYouTubeIframeAPIReady = initializePlayer
    }
  }, [videoId, start, end])

  const initializePlayer = () => {
    if (playerRef.current) return

    playerRef.current = new window.YT.Player(`youtube-player-${videoId}`, {
      height: '360',
      width: '100%',
      videoId: videoId,
      playerVars: {
        start: start,
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0
      },
      events: {
        onReady: () => {
          setIsReady(true)
          // Start monitoring playback time
          startTimeMonitoring()
        },
        onStateChange: (event) => {
          // Auto-pause when video ends
          if (event.data === window.YT.PlayerState.ENDED) {
            onCheckpointReached?.()
          }
        }
      }
    })
  }

  const startTimeMonitoring = () => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime()
        setCurrentTime(time)
        
        // Auto-pause when reaching end time
        if (time >= end) {
          playerRef.current.pauseVideo()
          setIsPaused(true)
          onCheckpointReached?.()
          clearInterval(interval)
        }
      }
    }, 500)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }

  useEffect(() => {
    if (isReady && start !== undefined) {
      // Use the ref method instead of local function
      if (ref && ref.current) {
        ref.current.playFrom(start)
      }
    }
  }, [isReady, start, ref])

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
        <div id={`youtube-player-${videoId}`} className="w-full h-[500px]"></div>
      </div>
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-4 bg-gray-800/50 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-600">
          <span className="text-gray-300 text-sm">
            <span className="text-blue-400 font-mono">{Math.floor(currentTime)}s</span>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-400 font-mono">{end}s</span>
          </span>
          {isPaused && (
            <span className="flex items-center space-x-2 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Checkpoint Reached</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer
