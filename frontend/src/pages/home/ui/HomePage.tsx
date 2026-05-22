import { AiRecommendation } from './ai/AiRecommendation'
import { Catalog } from './catalog/Catalog'
import { FAQ } from './faq/FAQ'
import { Hero } from './hero/Hero'

export const HomePage = () => {
  return (
    <>
      <Hero />
      <Catalog />
      <AiRecommendation />
      <FAQ />
    </>
  )
}
