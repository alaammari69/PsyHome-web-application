import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import NavigationItem from './components/NavigationBar'

function App() {

  return (
    <>
      <NavigationItem item={{logo_directory: "/src/assets/logos/dashboard_logo.png", text: "Dashboard"}}/>
    </>
  )
}

export default App
