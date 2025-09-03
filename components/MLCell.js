import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'

export default function MLCell({ prompt, starterCode, onComplete }) {
  const [code, setCode] = useState(starterCode || '')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [pyodide, setPyodide] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [trainingProgress, setTrainingProgress] = useState(null)
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

  const runTraining = async () => {
    if (!pyodide) {
      setOutput('Error: Python runtime not loaded yet')
      return
    }

    setIsRunning(true)
    setOutput('Training linear regression model...\n')
    setTrainingProgress({ epoch: 0, loss: 0 })

    try {
      // Enhanced training code with progress tracking
      const trainingCode = `
import numpy as np

# Generate synthetic data
np.random.seed(0)
X = 2 * np.random.rand(100, 1)
y = 4 + 3 * X + np.random.randn(100, 1)

# Initialize parameters
theta = np.random.randn(2, 1)
learning_rate = 0.01
epochs = 100

# Training loop with gradient descent
losses = []
for epoch in range(epochs):
    # Forward pass
    y_pred = theta[0] + theta[1] * X
    
    # Compute loss
    loss = np.mean((y_pred - y) ** 2)
    losses.append(loss)
    
    # Compute gradients
    grad_0 = np.mean(2 * (y_pred - y))
    grad_1 = np.mean(2 * (y_pred - y) * X)
    
    # Update parameters
    theta[0] -= learning_rate * grad_0
    theta[1] -= learning_rate * grad_1
    
    # Update progress every 10 epochs
    if epoch % 10 == 0:
        print(f"Epoch {epoch}: Loss = {loss:.4f}")

# Final results
print(f"\\nTraining completed!")
print(f"Final parameters: theta_0 = {theta[0][0]:.4f}, theta_1 = {theta[1][0]:.4f}")
print(f"Final loss: {losses[-1]:.4f}")

# Create plot data
plot_data = {
    'type': 'scatter',
    'mode': 'markers',
    'x': X.flatten().tolist(),
    'y': y.flatten().tolist(),
    'name': 'Data Points',
    'marker': {'color': 'blue', 'size': 6}
}

# Add regression line
X_line = np.array([[0], [2]])
y_line = theta[0] + theta[1] * X_line
regression_line = {
    'type': 'scatter',
    'mode': 'lines',
    'x': X_line.flatten().tolist(),
    'y': y_line.flatten().tolist(),
    'name': 'Regression Line',
    'line': {'color': 'red', 'width': 3}
}

# Store for plotting
plot_data_list = [plot_data, regression_line]
loss_history = losses
`

      // Capture stdout and track progress
      let stdout = ''
      let currentEpoch = 0
      let currentLoss = 0
      
      pyodide.globals.set('print', (text) => {
        stdout += text + '\n'
        // Parse progress updates
        if (text.includes('Epoch') && text.includes('Loss')) {
          const match = text.match(/Epoch (\d+): Loss = ([\d.]+)/)
          if (match) {
            currentEpoch = parseInt(match[1])
            currentLoss = parseFloat(match[2])
            setTrainingProgress({ epoch: currentEpoch, loss: currentLoss })
          }
        }
      })

      // Run the training code
      await pyodide.runPythonAsync(trainingCode)
      
      // Get plot data and render
      const plotDataList = pyodide.globals.get('plot_data_list')
      const lossHistory = pyodide.globals.get('loss_history')
      
      if (plotDataList && plotDataList.length > 0) {
        renderTrainingPlot(plotDataList, lossHistory)
      }

      // Display final output
      setOutput(stdout)
      setTrainingProgress(null)
      
    } catch (error) {
      setOutput(`Error: ${error.message}`)
      setTrainingProgress(null)
    } finally {
      setIsRunning(false)
    }
  }

  const renderTrainingPlot = (plotDataList, lossHistory) => {
    if (!window.Plotly || !plotContainerRef.current) return

    // Create subplots: data + regression line on top, loss curve on bottom
    const data = plotDataList.map(trace => ({
      ...trace,
      x: Array.isArray(trace.x) ? trace.x : Array.from(trace.x),
      y: Array.isArray(trace.y) ? trace.y : Array.from(trace.y)
    }))

    // Add loss curve
    if (lossHistory && lossHistory.length > 0) {
      data.push({
        x: Array.from({ length: lossHistory.length }, (_, i) => i),
        y: Array.from(lossHistory),
        type: 'scatter',
        mode: 'lines',
        name: 'Training Loss',
        line: { color: 'green', width: 2 },
        xaxis: 'x2',
        yaxis: 'y2'
      })
    }

    const layout = {
      title: 'Linear Regression Training Results',
      grid: {
        rows: 2,
        cols: 1,
        pattern: 'independent'
      },
      xaxis: { 
        title: 'X',
        domain: [0, 1]
      },
      yaxis: { 
        title: 'y',
        domain: [0.55, 1]
      },
      xaxis2: { 
        title: 'Epoch',
        domain: [0, 1]
      },
      yaxis2: { 
        title: 'Loss',
        domain: [0, 0.45]
      },
      margin: { t: 50, r: 50, b: 60, l: 60 },
      height: 400,
      showlegend: true
    }

    window.Plotly.newPlot(plotContainerRef.current, data, layout)
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
          <span className="text-sm text-gray-300 font-mono">Machine Learning Code</span>
        </div>
        <Editor
          height="350px"
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
          onClick={runTraining}
          disabled={isRunning || !pyodide}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isRunning ? (
            <span className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Training...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Run Training</span>
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

      {/* Training Progress */}
      {trainingProgress && (
        <div className="bg-blue-600/20 p-6 border border-blue-500 rounded-xl mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-200">
              Training Progress: Epoch {trainingProgress.epoch}/100
            </span>
            <span className="text-sm text-blue-300 font-mono">
              Loss: {trainingProgress.loss.toFixed(4)}
            </span>
          </div>
          <div className="w-full bg-blue-600/30 rounded-full h-3">
            <div 
              className="bg-blue-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(trainingProgress.epoch / 100) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {output && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
            <span className="text-sm text-gray-300 font-mono">Training Output</span>
          </div>
          <pre className="p-4 text-sm font-mono overflow-x-auto max-h-40 overflow-y-auto text-green-400 bg-gray-900">
            {output}
          </pre>
        </div>
      )}

      {/* Training Results Plot */}
      <div ref={plotContainerRef} className="plot-container w-full h-[500px]"></div>
    </div>
  )
}
