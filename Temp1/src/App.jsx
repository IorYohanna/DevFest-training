import React from 'react'
import Hero from './components/Hero'
import Section from './components/Section'
import NavBar from './components/NavBar'
import Features from './components/Features'
import Story from './components/Story'
import Contact from './components/Contact'
import SectionHorizontal from './components/SectionHorizontal'
import Footer from './components/Footer'
import TextTicker from './components/TypeTicker'
import ScrollingTextSection from './components/TypeTicker'
import ScrollGallery from './components/textLearn/ScrollGallery'
import MenuBar from './components/MenuBar'
import Cards from './components/Cards'
import ParallaxGallery from './components/ParallaxGalery'
import FileAudit from './Pages/FilesAudit'
import Hallucination from './Pages/Hallucination'

const App = () => {
  return (
    <main className="relative min-h-screen w-screen overflow-hidden">
{/*       <Hero />
      <SectionHorizontal />
      <ParallaxGallery />
      <Features />
      <Story />
      <Contact />
      <MenuBar />
      <Footer />  
      <FileAudit/> */}
      <Hallucination/>
    </main>
  )
}

export default App