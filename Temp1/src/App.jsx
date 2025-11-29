import React from 'react'
import Hero from './components/Hero'
import Section from './components/Section'
import NavBar from './components/NavBar'
import Features from './components/Features'
import Story from './components/Story'
import Contact from './components/Contact'
import SectionHorizontal from './components/SectionHorizontal'
import Footer from './components/Footer'


const App = () => {
  return (
    <main className="relative min-h-screen w-screen overflow-hidden">
      <NavBar/>
      <Hero/>
      <Section/>
      <Features/>
      <Story/>
      <Contact/>
      <SectionHorizontal/>
      <Footer/>
    </main>
     
  )
}

export default App