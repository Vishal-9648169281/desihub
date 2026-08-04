import { Outlet } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import MobileTabBar from '@/components/MobileTabBar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main className="pb-20 pt-14 sm:pt-16 lg:pb-8">
        <Outlet />
      </main>
      <MobileTabBar />
    </div>
  )
}
