'use client'
import HeroSection from '@/components/home/HeroSection'
import PromotionsBanner from '@/components/home/PromotionsBanner'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import LocationsSection from '@/components/home/LocationsSection'
import ScreensSection from '@/components/home/ScreensSection'
import SectionTwo from '@/components/home/SectionTwo'
import SectionExclu from '@/components/home/SectionExclu'
import SectionEvent3 from '@/components/home/SectionEvent3'
import SectionRose4 from '@/components/home/SectionRose4'
import SectionWork5 from '@/components/home/SectionWork5'

export default function Home() {
  return (
    <>
      <HeroSection />
      <SectionTwo />
      <SectionExclu />
      <SectionEvent3 />
      <SectionRose4 />
      <SectionWork5 />
      <LocationsSection/>
      <ScreensSection />
      <PromotionsBanner />
      <TestimonialsSection />

    </>
  )
}
