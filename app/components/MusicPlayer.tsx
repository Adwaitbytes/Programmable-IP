'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface MusicPlayerProps {
  audioUrl: string
  title: string
  artist: string
  imageUrl: string
  onPlay?: () => void
  onPause?: () => void
}

export default function MusicPlayer({
  audioUrl,
  title,
  artist,
  imageUrl,
  onPlay,
  onPause
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.volume = volume

      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0)
        setIsLoading(false)
      })

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
        setCurrentTime(0)
        onPause?.()
      })

      audioRef.current.addEventListener('waiting', () => setIsLoading(true))
      audioRef.current.addEventListener('canplay', () => setIsLoading(false))
    }

    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [audioUrl, onPause, volume])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        onPause?.()
      } else {
        audioRef.current.play()
        onPlay?.()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const time = percent * duration
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newVolume = Math.min(1, Math.max(0, percent))
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.8
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10)
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="music-player p-6 space-y-6"
    >
      {/* Album Art & Info */}
      <div className="flex items-center gap-5">
        <motion.div
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
          className="relative w-24 h-24 rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20 flex-shrink-0"
        >
          <img
            src={imageUrl || 'https://via.placeholder.com/200x200?text=🎵'}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=🎵'
            }}
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/20" />
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white truncate mb-1">
            {title}
          </h3>
          <p className="text-gray-400 truncate mb-3">{artist}</p>

          {/* Mini Visualizer */}
          {isPlaying && (
            <div className="music-visualizer h-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="music-visualizer-bar"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.3 + Math.random() * 0.3}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div
          className="progress-track group"
          onClick={handleSeek}
        >
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Skip Backward */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={skipBackward}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </motion.button>

        {/* Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          disabled={isLoading}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}

          {/* Pulse ring when playing */}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-purple-400"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>

        {/* Skip Forward */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={skipForward}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </motion.button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={toggleMute}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          {isMuted || volume === 0 ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : volume < 0.5 ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-5.657-2.343a8 8 0 010-11.314" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
        <div
          className="w-24 h-1.5 bg-white/10 rounded-full cursor-pointer relative"
          onClick={handleVolumeChange}
        >
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"
            style={{ left: `${(isMuted ? 0 : volume) * 100}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>
        <span className="text-xs text-gray-500 w-8">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </motion.div>
  )
}