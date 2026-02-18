import React from 'react'
import ReactDOM from 'react-dom/client'
import GanttApp from './GanttApp'

// Reset default styles
const style = document.createElement('style')
style.textContent = `* { margin: 0; padding: 0; box-sizing: border-box; } body { background: #0E1117; }`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GanttApp />
  </React.StrictMode>
)
