'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import NotificationPanel from './NotificationPanel'

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount] = useState(3) // À remplacer par un état global

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-emerald-600 rounded-lg hover:bg-gray-100"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && <NotificationPanel onClose={() => setIsOpen(false)} />}
    </div>
  )
}