import React from 'react'
import Hero from './components/Hero'
import Section from './components/Section'
import NavBar from './components/NavBar'
import Features from './components/Features'
import Story from './components/Story'
import Contact from './components/Contact'
import Footer from './components/Footer'
import TextTicker from './components/TypeTicker'
import ScrollingTextSection from './components/TypeTicker'


const App = () => {
  return (
    <main className="relative min-h-screen w-screen overflow-hidden">
      <NavBar/>
      <Section/>

      {/* <Hero/>
      <Features/>
      <Story/>
      <Contact/>
      <Footer/>  */}
    </main>
     
  )
}

export default App