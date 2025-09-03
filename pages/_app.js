import '../styles/globals.css'
import { useEffect } from 'react'

// Load external scripts dynamically
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Load YouTube IFrame API
    loadScript('https://www.youtube.com/iframe_api').catch(console.error)
    
    // Load Plotly for visualizations
    loadScript('https://cdn.plot.ly/plotly-latest.min.js').catch(console.error)
  }, [])

  return <Component {...pageProps} />
}
