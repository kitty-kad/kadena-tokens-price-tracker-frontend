import { useState, useEffect } from 'react'
import { Navigation } from './components/navigation'
import { About } from './components/about'
import { Prices } from './components/prices'
import { Footer } from './components/footer'
import { Socials } from './components/socials'
import {Projects} from './components/projects'
import JsonData from './data/data.json'
import SmoothScroll from 'smooth-scroll'

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
})

const App = () => {
  const [landingPageData, setLandingPageData] = useState({})
  useEffect(() => {
    setLandingPageData(JsonData)
  }, [])

  return (
    <div>
      <Navigation />
      <Prices/>
      <About data={landingPageData.About} />
      <Projects data={landingPageData.Projects}/>
      <Socials data={landingPageData.Socials} />
      <Footer />
    </div>
  )
}

export default App
