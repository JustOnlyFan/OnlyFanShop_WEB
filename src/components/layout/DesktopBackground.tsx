'use client'

import { ShoppingBagIcon, BuildingStorefrontIcon, PhoneIcon, UserIcon, ShoppingCartIcon, BellIcon } from '@heroicons/react/24/outline'
import { DesktopIcon } from '@/components/ui/DesktopIcon'
import { DesktopWallpaper } from './DesktopWallpaper'

export function DesktopBackground() {
  return (
    <div className="fixed inset-0">
      {/* Desktop Wallpaper */}
      <DesktopWallpaper />


    </div>
  )
}
