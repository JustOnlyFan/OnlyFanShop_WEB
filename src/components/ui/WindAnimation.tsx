'use client'

import { motion } from 'framer-motion'

interface WindParticle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

export function WindAnimation() {
  // Generate wind particles
  const particles: WindParticle[] = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.5 + 0.2,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/20 backdrop-blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
          }}
          animate={{
            x: [
              Math.random() * 100 - 50,
              Math.random() * 200 - 100,
              Math.random() * 150 - 75,
              Math.random() * 100 - 50,
            ],
            y: [
              Math.random() * 100 - 50,
              Math.random() * 200 - 100,
              Math.random() * 150 - 75,
              Math.random() * 100 - 50,
            ],
            scale: [1, 1.5, 0.8, 1.2, 1],
            opacity: [
              particle.opacity,
              particle.opacity * 1.5,
              particle.opacity * 0.5,
              particle.opacity * 1.2,
              particle.opacity,
            ],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Wind lines */}
      {Array.from({ length: 15 }, (_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute w-1 h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            rotate: `${Math.random() * 45 - 22.5}deg`,
          }}
          animate={{
            x: [
              Math.random() * 200 - 100,
              Math.random() * 300 - 150,
              Math.random() * 200 - 100,
            ],
            y: [
              Math.random() * 200 - 100,
              Math.random() * 300 - 150,
              Math.random() * 200 - 100,
            ],
            opacity: [0, 0.3, 0.1, 0.2, 0],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Floating wind swirls */}
      {Array.from({ length: 10 }, (_, i) => (
        <motion.div
          key={`swirl-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            rotate: [0, 360],
            x: [
              Math.random() * 300 - 150,
              Math.random() * 400 - 200,
              Math.random() * 300 - 150,
            ],
            y: [
              Math.random() * 300 - 150,
              Math.random() * 400 - 200,
              Math.random() * 300 - 150,
            ],
            scale: [0.5, 1, 0.8, 1.2, 0.5],
          }}
          transition={{
            duration: Math.random() * 25 + 20,
            repeat: Infinity,
            delay: Math.random() * 12,
            ease: "easeInOut",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            className="text-white/10"
          >
            <path
              d="M20,20 Q15,15 20,10 Q25,15 20,20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}












