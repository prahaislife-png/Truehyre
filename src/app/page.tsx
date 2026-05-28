import MarketingNav from '@/components/marketing/MarketingNav'
import Hero from '@/components/marketing/Hero'
import LogoCarousel from '@/components/marketing/LogoCarousel'
import ProblemStats from '@/components/marketing/ProblemStats'
import HowItWorks from '@/components/marketing/HowItWorks'
import Checkpoints from '@/components/marketing/Checkpoints'
import Features from '@/components/marketing/Features'
import RoiCalculator from '@/components/marketing/RoiCalculator'
import Personas from '@/components/marketing/Personas'
import ComparisonTable from '@/components/marketing/ComparisonTable'
import Pricing from '@/components/marketing/Pricing'
import CtaBanner from '@/components/marketing/CtaBanner'
import MarketingFooter from '@/components/marketing/MarketingFooter'

export default function Home() {
  return (
    <main className="bg-white">
      <MarketingNav />
      <Hero />
      <LogoCarousel />
      <ProblemStats />
      <HowItWorks />
      <Checkpoints />
      <Features />
      <RoiCalculator />
      <Personas />
      <ComparisonTable />
      <Pricing />
      <CtaBanner />
      <MarketingFooter />
    </main>
  )
}
