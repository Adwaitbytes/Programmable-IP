'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '../components/Navigation'
import MusicPlayer from '../components/MusicPlayer'
import Link from 'next/link'
import { useWalletConnection } from '../lib/useWalletConnection'

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

const ASSET_TYPE_CONFIG: Record<AssetType, { icon: string; gradient: string; color: string }> = {
  music: { icon: '🎵', gradient: 'from-purple-500 to-pink-500', color: 'purple' },
  character: { icon: '🦸', gradient: 'from-blue-500 to-cyan-500', color: 'blue' },
  story: { icon: '📚', gradient: 'from-green-500 to-emerald-500', color: 'green' },
  image: { icon: '🎨', gradient: 'from-orange-500 to-amber-500', color: 'orange' },
  concept: { icon: '💡', gradient: 'from-cyan-500 to-teal-500', color: 'cyan' },
  other: { icon: '📄', gradient: 'from-gray-500 to-slate-500', color: 'gray' },
}

export default function DashboardPage() {
  const { address, isConnected, connectWallet } = useWalletConnection()
  const [userAssets, setUserAssets] = useState<AssetData[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [selectedTrack, setSelectedTrack] = useState<AssetData | null>(null)
  const [filterType, setFilterType] = useState<AssetType | 'all'>('all')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (isConnected && address) {
      loadUserAssets()
    } else {
      setLoading(false)
    }
  }, [isConnected, address])

  const loadUserAssets = async () => {
    try {
      const response = await fetch('/api/get-assets')
      const data = await response.json()
      if (data.success) {
        const assets = (data.assets || []).filter((item: AssetData) =>
          item.owner.toLowerCase() === address?.toLowerCase()
        )
        setUserAssets(assets.sort((a: AssetData, b: AssetData) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ))
      }
    } catch (error) {
      console.error('Error loading assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/delete-music?id=${id}&owner=${address}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setMessage({ text: `"${title}" deleted successfully`, type: 'success' })
        loadUserAssets()
      } else {
        setMessage({ text: `Failed to delete: ${data.error}`, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'Error deleting asset', type: 'error' })
    } finally {
      setDeleting(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleToggleHide = async (id: string, title: string, currentHidden: boolean) => {
    setToggling(id)
    try {
      const res = await fetch(`/api/toggle-hide?id=${id}&owner=${address}`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMessage({ text: `"${title}" ${data.hidden ? 'hidden' : 'visible'}`, type: 'success' })
        loadUserAssets()
      } else {
        setMessage({ text: `Failed: ${data.error}`, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'Error updating visibility', type: 'error' })
    } finally {
      setToggling(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  // Stats
  const stats = {
    total: userAssets.length,
    visible: userAssets.filter(a => !a.hidden).length,
    hidden: userAssets.filter(a => a.hidden).length,
    byType: Object.keys(ASSET_TYPE_CONFIG).reduce((acc, type) => {
      acc[type as AssetType] = userAssets.filter(a => a.type === type).length
      return acc
    }, {} as Record<AssetType, number>),
  }

  const filteredAssets = filterType === 'all'
    ? userAssets
    : userAssets.filter(a => a.type === filterType)

  if (!isConnected) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#030712]">
        <div className="bg-animated-gradient">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
        </div>
        <div className="bg-grid" />
        <Navigation />

        <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl mb-6">
                📊
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Your Dashboard</h1>
              <p className="text-gray-400 mb-8">
                Connect your wallet to view your registered IP assets and manage your portfolio.
              </p>
              <button onClick={connectWallet} className="btn-primary text-lg px-8 py-4">
                <span>🦊</span>
                Connect Wallet
              </button>
            </motion.div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030712]">
      {/* Background */}
      <div className="bg-animated-gradient">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-grid" />

      <Navigation />

      <main className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                My <span className="text-gradient">Dashboard</span>
              </h1>
              <p className="text-gray-400 font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <button onClick={loadUserAssets} className="btn-ghost">
                🔄 Refresh
              </button>
              <Link href="/upload" className="btn-primary">
                <span>✨</span>
                Create New IP
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total IPs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-green-400">{stats.visible}</div>
              <div className="stat-label">Visible</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-yellow-400">{stats.hidden}</div>
              <div className="stat-label">Hidden</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-purple-400">$0</div>
              <div className="stat-label">Earnings</div>
            </div>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            <button
              onClick={() => setFilterType('all')}
              className={`btn-pill ${filterType === 'all' ? 'active' : ''}`}
            >
              All ({stats.total})
            </button>
            {Object.entries(ASSET_TYPE_CONFIG).map(([type, config]) =>
              stats.byType[type as AssetType] > 0 && (
                <button
                  key={type}
                  onClick={() => setFilterType(type as AssetType)}
                  className={`btn-pill ${filterType === type ? 'active' : ''}`}
                >
                  {config.icon} {type} ({stats.byType[type as AssetType]})
                </button>
              )
            )}
          </motion.div>

          {/* Assets Grid/List */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] skeleton rounded-2xl" />
              ))}
            </div>
          ) : filteredAssets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel rounded-2xl p-12 text-center"
            >
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-white mb-2">No IPs Yet</h3>
              <p className="text-gray-400 mb-6">
                Start protecting your creative works by registering your first IP.
              </p>
              <Link href="/upload" className="btn-primary">
                Register Your First IP
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredAssets.map((asset, i) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`asset-card ${asset.hidden ? 'opacity-60' : ''}`}
                >
                  {/* Image */}
                  <div
                    className="asset-card-image cursor-pointer"
                    onClick={() => asset.type === 'music' ? setSelectedTrack(asset) : window.open(asset.mediaUrl, '_blank')}
                  >
                    {asset.coverUrl ? (
                      <img
                        src={asset.coverUrl}
                        alt={asset.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=IP'
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${ASSET_TYPE_CONFIG[asset.type].gradient} flex items-center justify-center`}>
                        <span className="text-7xl">{ASSET_TYPE_CONFIG[asset.type].icon}</span>
                      </div>
                    )}
                    <div className="asset-card-overlay" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className={`badge badge-${asset.type}`}>
                        {ASSET_TYPE_CONFIG[asset.type].icon} {asset.type}
                      </span>
                      {asset.hidden && (
                        <span className="badge badge-warning">🔒 Hidden</span>
                      )}
                    </div>

                    {asset.type === 'music' && (
                      <div className="asset-card-play">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-white mb-1 truncate">{asset.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      {asset.ipId && (
                        <a
                          href={`https://aeneid.explorer.story.foundation/ipa/${asset.ipId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-medium transition-colors"
                        >
                          View IP ↗
                        </a>
                      )}
                      <button
                        onClick={() => handleToggleHide(asset.id, asset.title, asset.hidden || false)}
                        disabled={toggling === asset.id}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        title={asset.hidden ? 'Show' : 'Hide'}
                      >
                        {toggling === asset.id ? '...' : asset.hidden ? '👁️' : '🔒'}
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id, asset.title)}
                        disabled={deleting === asset.id}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === asset.id ? '...' : '🗑️'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* Music Player Modal */}
      <AnimatePresence>
        {selectedTrack && selectedTrack.type === 'music' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
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

      {/* Toast Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border z-50 ${message.type === 'success'
                ? 'bg-green-500/20 border-green-500/30 text-green-200'
                : 'bg-red-500/20 border-red-500/30 text-red-200'
              }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}