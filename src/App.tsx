import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Actions from "./Actions";
import PasswordProtection from "./Components/Auth/PasswordProtection";
import './App.css'
import './css/Actions.css'

function ExternalRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);
  return null;
}

function App() {
  return (
    <PasswordProtection>
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
    </PasswordProtection>
  )
}

export default App
