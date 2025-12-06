import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Components / Pages
import Hero from './components/Hero'
import NavBar from './components/NavBar'
import Features from './components/Features'
import Story from './components/Story'
import Contact from './components/Contact'
import SectionHorizontal from './components/SectionHorizontal'
import Footer from './components/Footer'
import Section from './components/Section'
import MenuBar from './components/MenuBar'
import ParallaxGallery from './components/ParallaxGalery'

// Pages
import FileAudit from './Pages/FilesAudit'
import Hallucination from './Pages/Hallucination'
import Detoxify from './components/detoxify/Detoxify'
import Instagram from './components/instagram/Instagram'

const Home = () => (
  <main className="relative min-h-screen w-screen overflow-hidden">
    <Hero />
    <Section />
    <SectionHorizontal />
    <ParallaxGallery />
    <Features />
    <Story />
    <Contact />
    <MenuBar />
    <Footer />
  </main>
)

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Other Pages */}
        <Route path="/hallucination" element={<Hallucination />} />
        <Route path="/detoxify" element={<Detoxify />} />
        <Route path="/instagram" element={<Instagram />} />
        <Route path="/audit" element={<FileAudit />} />
      </Routes>
    </Router>
  )
}

export default App
