import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'

export default function CodeCell({ prompt, starterCode, onComplete }) {
  const [code, setCode] = useState(starterCode || '')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [pyodide, setPyodide] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const plotContainerRef = useRef(null)

  // Load Pyodide on component mount
  useEffect(() => {
    loadPyodide()
  }, [])

  const loadPyodide = async () => {
    try {
      setIsLoading(true)
      // Load Pyodide from CDN
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js'
      script.onload = async () => {
        const pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/'
        })
        
        // Install numpy
        await pyodideInstance.loadPackage('numpy')
        setPyodide(pyodideInstance)
        setIsLoading(false)
      }
      document.head.appendChild(script)
    } catch (error) {
      console.error('Failed to load Pyodide:', error)
      setOutput('Error: Failed to load Python runtime')
      setIsLoading(false)
    }
  }

  const runCode = async () => {
    if (!pyodide) {
      setOutput('Error: Python runtime not loaded yet')
      return
    }

    setIsRunning(true)
    setOutput('Running...\n')

    try {
      // Capture stdout
      let stdout = ''
      pyodide.globals.set('print', (text) => {
        stdout += text + '\n'
      })

      // Run the Python code
      const result = await pyodide.runPythonAsync(code)
      
      // Check for plot data
      const plotData = pyodide.globals.get('plot_data')
      if (plotData && plotData.type) {
        renderPlot(plotData)
      }

      // Display output
      let finalOutput = stdout
      if (result !== undefined) {
        finalOutput += `\nResult: ${result}\n`
      }
      setOutput(finalOutput)
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const renderPlot = (plotData) => {
    if (!window.Plotly || !plotContainerRef.current) return

    // Convert numpy arrays to regular arrays if needed
    const processedData = {
      ...plotData,
      x: Array.isArray(plotData.x) ? plotData.x : Array.from(plotData.x),
      y: Array.isArray(plotData.y) ? plotData.y : Array.from(plotData.y)
    }

    window.Plotly.newPlot(plotContainerRef.current, [processedData], {
      margin: { t: 20, r: 20, b: 40, l: 40 },
      height: 300
    })
  }

  const markComplete = () => {
    onComplete?.()
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-3">{prompt}</h3>
        </div>
        <div className="flex items-center justify-center h-32 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center space-x-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading Python runtime...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-3">{prompt}</h3>
      </div>
      
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
          <span className="text-sm text-gray-300 font-mono">Python Code</span>
        </div>
        <Editor
          height="300px"
          defaultLanguage="python"
          value={code}
          onChange={setCode}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={runCode}
          disabled={isRunning || !pyodide}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isRunning ? (
            <span className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Running...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Run Code</span>
            </span>
          )}
        </button>
        
        <button
          onClick={markComplete}
          className="btn-success"
        >
          <span className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Mark Complete</span>
          </span>
        </button>
      </div>

      {output && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
            <span className="text-sm text-gray-300 font-mono">Output</span>
          </div>
          <pre className="p-4 text-sm font-mono overflow-x-auto text-green-400 bg-gray-900">
            {output}
          </pre>
        </div>
      )}

      <div ref={plotContainerRef} className="plot-container w-full h-96"></div>
    </div>
  )
}
