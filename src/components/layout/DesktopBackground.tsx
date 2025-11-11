'use client'

import { DesktopWallpaper } from './DesktopWallpaper'
import { WindAnimation } from '@/components/ui/WindAnimation'

export function DesktopBackground() {
  return (
    <div className="fixed inset-0">
      {/* Desktop Wallpaper */}
      <DesktopWallpaper />
      
      {/* Wind Animation Effects */}
      <WindAnimation />
    </div>
  )
}
