'use client'

import { X, Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { fetchNotifications, markAsRead } from '@/lib/api/notifications'
import { Notification } from '@/types/notification'

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchNotifications()
        setNotifications(data)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }
    fetchData()

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  return (
    <div 
      ref={panelRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Notifications</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li key={notification.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <p className={`text-sm ${
                    notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                  }`}>
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-emerald-500 hover:text-emerald-600"
                      title="Marquer comme lu"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-sm text-gray-500 text-center">Aucune notification</p>
        )}
      </div>
    </div>
  )
}