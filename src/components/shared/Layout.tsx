import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import MiniPlayer from '../audio/MiniPlayer'
import { useAppStore } from '../../stores/useAppStore'

const Layout: React.FC = () => {
  const { currentAudio } = useAppStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green">
      <Header />
      
      <main className="pt-16 pb-4">
        <Outlet />
      </main>
      
      {currentAudio && <MiniPlayer />}
    </div>
  )
}

export default Layout