'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from './components/Navigation'
import MusicPlayer from './components/MusicPlayer'
import { useWalletConnection } from './lib/useWalletConnection'

// Types
type AssetType = 'music' | 'character' | 'story' | 'image' | 'concept' | 'other'

interface AssetData {
  id: string
  type: AssetType
  title: string
  artist: string
  description: string
  price: string
  mediaUrl: string
  coverUrl: string
  owner: string
  metadataUrl: string
  createdAt: string
  ipId?: string
  txHash?: string
  hidden?: boolean
}

export default function Home() {
  const { address, isConnected, isMobile, connectWallet } = useWalletConnection()
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [myAssets, setMyAssets] = useState<AssetData[]>([])
  const [selectedTrack, setSelectedTrack] = useState<AssetData | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  // Use address from wagmi hook
  const account = address || ''
  const connected = isConnected

  // Load user's assets only
  const loadMyAssets = async (userAddress: string) => {
    try {
      console.log('📂 Loading my assets for:', userAddress)
      const response = await fetch('/api/get-assets')
      const data = await response.json()
      console.log('📋 All assets loaded:', data)

      if (data.success) {
        // Filter only assets owned by the connected user
        const myData = (data.assets || []).filter(
          (asset: AssetData) => asset.owner.toLowerCase() === userAddress.toLowerCase()
        )
        console.log('🎵 My assets:', myData)
        setMyAssets(myData)
      }
    } catch (error) {
      console.error('💥 Error loading assets:', error)
    }
  }

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 8000)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will remove it from everywhere. This action cannot be undone.`)) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/delete-music?id=${id}&owner=${account}`, { // Note: We might need to update delete API too
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        showMessage(`✅ Successfully deleted "${title}"`, 'success')
        // Refresh the list
        if (account) {
          await loadMyAssets(account)
        }
      } else {
        showMessage(`❌ Failed to delete: ${data.error}`, 'error')
      }
    } catch (error) {
      showMessage(`❌ Error deleting asset: ${error}`, 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleHide = async (id: string, title: string, currentHiddenState: boolean) => {
    const action = currentHiddenState ? 'show' : 'hide'
    if (!confirm(`Are you sure you want to ${action} "${title}" from the explore page?`)) {
      return
    }

    setToggling(id)
    try {
      const res = await fetch(`/api/toggle-hide?id=${id}&owner=${account}`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        showMessage(
          `✅ ${data.hidden ? 'Hidden from explore page' : 'Now visible on explore page'}: "${title}"`,
          'success'
        )
        // Refresh the list
        if (account) {
          await loadMyAssets(account)
        }
      } else {
        showMessage(`❌ Failed to ${action}: ${data.error}`, 'error')
      }
    } catch (error) {
      showMessage(`❌ Error toggling visibility: ${error}`, 'error')
    } finally {
      setToggling(null)
    }
  }

  // Load assets when account changes
  useEffect(() => {
    if (connected && account) {
      loadMyAssets(account)
    } else {
      setMyAssets([])
    }
  }, [connected, account])

  return (
    <div className="min-h-screen relative overflow-hidden bg-story-dark selection:bg-blue-500/30">
      <Navigation />

      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-600/20 rounded-full blur-[120px] opacity-50 mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <span className="text-sm font-medium text-blue-400">Next Generation IP Protocol</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white text-glow">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Creative Ownership
              </span>
            </h1>

            <p className="text-xl text-story-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
              Register, discover, and monetize your creative works. From music and stories to characters and art.
              Built on Story Protocol.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {!connected ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connectWallet}
                  className="btn-primary min-w-[200px]"
                >
                  {isMobile ? '📱' : '🦊'} Connect Wallet
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/upload'}
                  className="btn-primary min-w-[200px]"
                >
                  Register IP
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/explore'}
                className="btn-secondary min-w-[200px]"
              >
                Explore Library
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* My Assets Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-white">My Portfolio</h2>
              {connected && myAssets.length > 0 && (
                <span className="text-story-text-secondary">{myAssets.length} Assets</span>
              )}
            </div>

            {!connected ? (
              <div className="glass-panel rounded-3xl p-16 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-8">
                  <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h3>
                <p className="text-story-text-secondary mb-8">
                  Connect your wallet to view and manage your registered IP assets.
                </p>
                <button onClick={connectWallet} className="btn-primary">
                  Connect Wallet
                </button>
              </div>
            ) : myAssets.length === 0 ? (
              <div className="glass-panel rounded-3xl p-16 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-8">
                  <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Start Your Journey</h3>
                <p className="text-story-text-secondary mb-8">
                  You haven't registered any IP assets yet. Create your first IP asset on Story Protocol.
                </p>
                <div className="flex gap-4 justify-center">
                  <button onClick={() => window.location.href = '/upload'} className="btn-primary">
                    Register IP
                  </button>
                  <button onClick={() => window.location.href = '/explore'} className="btn-secondary">
                    Explore
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myAssets.map((asset) => (
                  <motion.div
                    key={asset.id}
                    whileHover={{ y: -8 }}
                    className="card group cursor-pointer relative overflow-hidden"
                    onClick={() => {
                      if (asset.type === 'music') setSelectedTrack(asset)
                      else window.open(asset.mediaUrl, '_blank')
                    }}
                  >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleHide(asset.id, asset.title, asset.hidden || false)
                        }}
                        disabled={toggling === asset.id}
                        className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors"
                      >
                        {toggling === asset.id ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : asset.hidden ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(asset.id, asset.title)
                        }}
                        disabled={deleting === asset.id}
                        className="p-2 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 hover:bg-red-500/40 transition-colors"
                      >
                        {deleting === asset.id ? (
                          <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <div className="relative aspect-square rounded-xl overflow-hidden mb-5 bg-black/40">
                      <img
                        src={asset.coverUrl || asset.mediaUrl}
                        alt={asset.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Asset'
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />

                      {/* Type Badge */}
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10 flex items-center gap-1">
                        <span className="capitalize">{asset.type}</span>
                      </div>

                      {/* Play Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                          {asset.type === 'music' ? (
                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          ) : (
                            <span className="text-xl">👁️</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                        {asset.title}
                      </h3>
                      <p className="text-sm text-story-text-secondary">
                        by {asset.artist}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-4" onClick={(e) => e.stopPropagation()}>
                        <span className="text-blue-400 font-medium">
                          {asset.price && asset.price !== '0' ? `${asset.price} IP` : 'Free'}
                        </span>
                        {asset.ipId && (
                          <a
                            href={`https://aeneid.explorer.story.foundation/ipa/${asset.ipId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/10"
                          >
                            View IP ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Music Player Modal */}
      <AnimatePresence>
        {selectedTrack && selectedTrack.type === 'music' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTrack(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
              onClick={e => e.stopPropagation()}
            >
              <MusicPlayer
                audioUrl={selectedTrack.mediaUrl}
                title={selectedTrack.title}
                artist={selectedTrack.artist}
                imageUrl={selectedTrack.coverUrl}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border ${messageType === 'success'
              ? 'bg-green-500/20 border-green-500/30 text-green-200'
              : 'bg-red-500/20 border-red-500/30 text-red-200'
              }`}
          >
            <div className="flex items-center gap-3">
              {messageType === 'success' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
