'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Coin {
  id: number;
  x: number;
  y: number;
  rotation: number;
  delay: number;
  speed: number;
  opacity: number;
}

export default function MoneyRainEffect({ trigger = false }: { trigger?: boolean }) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      generateCoins();
      const timeout = setTimeout(() => setIsActive(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [trigger]);

  const generateCoins = () => {
    const newCoins: Coin[] = [];
    for (let i = 0; i < 30; i++) {
      newCoins.push({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: -50 - Math.random() * 200,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5,
        speed: 2 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.4,
      });
    }
    setCoins(newCoins);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {isActive &&
          coins.map((coin) => (
            <motion.div
              key={coin.id}
              initial={{
                x: coin.x,
                y: coin.y,
                rotate: coin.rotation,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                y: window.innerHeight + 100,
                rotate: coin.rotation + 720,
                opacity: [0, coin.opacity, coin.opacity, 0],
                scale: [0, 1, 1, 0.8],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: coin.speed,
                delay: coin.delay,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="absolute"
            >
              {/* Premium coin design - thin line circle with subtle shimmer */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="url(#goldGradient)"
                  strokeWidth="0.5"
                  fill="url(#goldFill)"
                  opacity="0.6"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="url(#goldGradient)"
                  strokeWidth="0.3"
                  fill="none"
                  opacity="0.4"
                />
                <text
                  x="12"
                  y="16"
                  textAnchor="middle"
                  fill="url(#goldGradient)"
                  fontSize="10"
                  fontWeight="300"
                  opacity="0.8"
                >
                  $
                </text>
                <defs>
                  <linearGradient
                    id="goldGradient"
                    x1="0"
                    y1="0"
                    x2="24"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFD700" />
                    <stop offset="0.5" stopColor="#FFA500" />
                    <stop offset="1" stopColor="#FFD700" />
                  </linearGradient>
                  <radialGradient
                    id="goldFill"
                    cx="12"
                    cy="12"
                    r="10"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFD700" stopOpacity="0.1" />
                    <stop offset="1" stopColor="#FFA500" stopOpacity="0.05" />
                  </radialGradient>
                </defs>
              </svg>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
