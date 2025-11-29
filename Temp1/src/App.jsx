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
import { Menu } from 'lucide-react'
import Test from './components/Test'
import ScrollGalery from './components/textLearn/ScrollGalery'
import TextGlitch from './assets/TextGlitch'


const App = () => {
  return (
    <main className="relative min-h-screen w-screen overflow-hidden">
      <Hero/>
      <Section/>
      <Features/>
      <Story/>
      <Contact/>
      <Test/>
      <TextGlitch/>
      <ScrollGalery/>
    
      <SectionHorizontal/>
      <Footer/>
    </main>
     
  )
}

export default App