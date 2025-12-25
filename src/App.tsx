import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./Dashboard";
import Actions from "./Actions";
import './App.css'
import './css/Actions.css'

function ExternalRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);
  return null;
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "auto",
        maxWidth: "100%",
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/actions/:action_id" element={<Actions />}/>
          <Route
            path="/tmobile"
            element={
              <ExternalRedirect url="https://www.t-mobile.com/business" />
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
    </>
  )
}

export default App
