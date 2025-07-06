// src/components/agribot/AgriBotButton.tsx
'use client';

import { useState, Suspense, lazy, useEffect } from 'react';
import { Bot } from 'lucide-react';

const ChatBox = lazy(() => import('@/components/ChatBox'));

export default function AgriBotButton() {
  const [showChat, setShowChat] = useState(false);
  const [isBotBlinking, setIsBotBlinking] = useState(false);

  // Animation de clignotement aléatoire
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% de chance de clignoter
        setIsBotBlinking(true);
        setTimeout(() => setIsBotBlinking(false), 200);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Bouton flottant du chat */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center">
        <button
          onClick={() => setShowChat(!showChat)}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
          aria-label="Ouvrir le chat avec AgriBot"
        >
          <Bot
            size={36}
            className={`text-green-600 transition-opacity duration-300 ${isBotBlinking ? 'opacity-40' : 'opacity-100'}`}
          />
        </button>
        <div className="mt-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full animate-pulse">
          Discuter avec AgriBot
        </div>
      </div>

      {/* Boîte de chat */}
      <Suspense fallback={<div className="fixed bottom-24 right-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl w-80 h-96 flex items-center justify-center">Chargement d'AgriBot...</div>}>
        {showChat && <ChatBox onClose={() => setShowChat(false)} />}
      </Suspense>
    </>
  );
}