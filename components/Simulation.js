import { useState, useEffect, useRef } from 'react'

export default function Simulation({ prompt, onComplete }) {
  const [demandIntercept, setDemandIntercept] = useState(100)
  const [demandSlope, setDemandSlope] = useState(-1)
  const [supplyIntercept, setSupplyIntercept] = useState(20)
  const [supplySlope, setSupplySlope] = useState(1)
  const [equilibrium, setEquilibrium] = useState({ price: 60, quantity: 40 })
  const plotContainerRef = useRef(null)

  useEffect(() => {
    calculateEquilibrium()
  }, [demandIntercept, demandSlope, supplyIntercept, supplySlope])

  useEffect(() => {
    if (window.Plotly && plotContainerRef.current) {
      renderPlot()
    }
  }, [equilibrium, demandIntercept, demandSlope, supplyIntercept, supplySlope])

  const calculateEquilibrium = () => {
    // Demand: P = demandIntercept + demandSlope * Q
    // Supply: P = supplyIntercept + supplySlope * Q
    // At equilibrium: demandIntercept + demandSlope * Q = supplyIntercept + supplySlope * Q
    // Solving for Q: Q = (demandIntercept - supplyIntercept) / (supplySlope - demandSlope)
    
    const quantity = (demandIntercept - supplyIntercept) / (supplySlope - demandSlope)
    const price = demandIntercept + demandSlope * quantity
    
    if (quantity > 0 && price > 0) {
      setEquilibrium({ price: Math.round(price * 100) / 100, quantity: Math.round(quantity * 100) / 100 })
    }
  }

  const renderPlot = () => {
    if (!window.Plotly || !plotContainerRef.current) return

    // Generate data points for plotting
    const maxQ = Math.max(equilibrium.quantity * 2, 100)
    const qValues = Array.from({ length: 101 }, (_, i) => (i * maxQ) / 100)
    
    const demandPrices = qValues.map(q => demandIntercept + demandSlope * q)
    const supplyPrices = qValues.map(q => supplyIntercept + supplySlope * q)

    const data = [
      {
        x: qValues,
        y: demandPrices,
        type: 'scatter',
        mode: 'lines',
        name: 'Demand',
        line: { color: '#3b82f6', width: 3 }
      },
      {
        x: qValues,
        y: supplyPrices,
        type: 'scatter',
        mode: 'lines',
        name: 'Supply',
        line: { color: '#ef4444', width: 3 }
      },
      {
        x: [equilibrium.quantity],
        y: [equilibrium.price],
        type: 'scatter',
        mode: 'markers',
        name: 'Equilibrium',
        marker: { 
          color: '#10b981', 
          size: 12,
          symbol: 'diamond'
        }
      }
    ]

    const layout = {
      title: 'Supply and Demand Simulation',
      xaxis: { 
        title: 'Quantity (Q)',
        range: [0, maxQ]
      },
      yaxis: { 
        title: 'Price (P)',
        range: [0, Math.max(...demandPrices, ...supplyPrices) * 1.1]
      },
      margin: { t: 50, r: 50, b: 60, l: 60 },
      height: 400,
      showlegend: true,
      legend: { x: 0.7, y: 0.9 }
    }

    window.Plotly.newPlot(plotContainerRef.current, data, layout)
  }

  const markComplete = () => {
    onComplete?.()
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-6">{prompt}</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Demand Controls */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h4 className="font-semibold text-blue-400 mb-4 text-lg">Demand Curve: P = {demandIntercept} + {demandSlope}Q</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Demand Intercept: <span className="text-blue-400 font-mono">{demandIntercept}</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={demandIntercept}
                  onChange={(e) => setDemandIntercept(Number(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Demand Slope: <span className="text-blue-400 font-mono">{demandSlope}</span>
                </label>
                <input
                  type="range"
                  min="-2"
                  max="-0.5"
                  step="0.1"
                  value={demandSlope}
                  onChange={(e) => setDemandSlope(Number(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Supply Controls */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h4 className="font-semibold text-red-400 mb-4 text-lg">Supply Curve: P = {supplyIntercept} + {supplySlope}Q</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Supply Intercept: <span className="text-red-400 font-mono">{supplyIntercept}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={supplyIntercept}
                  onChange={(e) => setSupplyIntercept(Number(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Supply Slope: <span className="text-red-400 font-mono">{supplySlope}</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={supplySlope}
                  onChange={(e) => setSupplySlope(Number(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Equilibrium Display */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
          <h4 className="font-semibold text-white mb-4 text-lg">Market Equilibrium</h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <span className="text-sm text-gray-400 block mb-2">Equilibrium Price</span>
              <div className="text-2xl font-bold text-green-400">${equilibrium.price}</div>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-400 block mb-2">Equilibrium Quantity</span>
              <div className="text-2xl font-bold text-green-400">{equilibrium.quantity} units</div>
            </div>
          </div>
        </div>
      </div>

      {/* Plot */}
      <div ref={plotContainerRef} className="plot-container w-full mb-8"></div>

      <div className="flex justify-end">
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
    </div>
  )
}
