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
import ScrollGalery from './components/textLearn/ScrollGalery'
import MenuBar from './components/MenuBar'
import Cards from './components/Cards'
import ParallaxGallery from './components/ParallaxGalery'
import MessageSection from './components/MessageSection'
import Hero2Section from './components/Hero2Section'

const App = () => {
  return (
    <main className="relative min-h-screen w-screen overflow-hidden">
      <Hero />
      <Hero2Section/>
      <ParallaxGallery />
      <Section />
      <Features />
      <Story />
      <Contact />
      <MenuBar />
      <ScrollGalery />
      <SectionHorizontal />
      <MessageSection />

      <Footer />

    </main>

  )
}

export default App