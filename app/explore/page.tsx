'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '../components/Navigation'
import MusicPlayer from '../components/MusicPlayer'

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

const ASSET_TYPE_CONFIG: Record<AssetType, { icon: string; label: string; gradient: string; color: string }> = {
  music: { icon: '🎵', label: 'Music', gradient: 'from-purple-500 to-pink-500', color: 'purple' },
  character: { icon: '🦸', label: 'Characters', gradient: 'from-blue-500 to-indigo-500', color: 'blue' },
  story: { icon: '📚', label: 'Stories', gradient: 'from-green-500 to-emerald-500', color: 'green' },
  image: { icon: '🎨', label: 'Images', gradient: 'from-orange-500 to-amber-500', color: 'orange' },
  concept: { icon: '💡', label: 'Concepts', gradient: 'from-cyan-500 to-teal-500', color: 'cyan' },
  other: { icon: '📄', label: 'Other', gradient: 'from-gray-500 to-slate-500', color: 'gray' },
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'artist', label: 'Artist A-Z' },
]

export default function ExplorePage() {
  const [assets, setAssets] = useState<AssetData[]>([])
  const [filteredAssets, setFilteredAssets] = useState<AssetData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrack, setSelectedTrack] = useState<AssetData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchAssets()
  }, [])

  useEffect(() => {
    filterAndSortAssets()
  }, [assets, searchTerm, typeFilter, sortBy])

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/get-assets')
      const data = await res.json()
      if (data.success) {
        const visibleAssets = (data.assets || []).filter((a: AssetData) => !a.hidden)
        setAssets(visibleAssets)
        setFilteredAssets(visibleAssets)
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortAssets = () => {
    let filtered = [...assets]

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter)
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(search) ||
        a.artist.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search)
      )
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'artist':
        filtered.sort((a, b) => a.artist.localeCompare(b.artist))
        break
    }

    setFilteredAssets(filtered)
  }

  const getTypeCounts = () => {
    const counts: Record<string, number> = { all: assets.length }
    assets.forEach(a => {
      counts[a.type] = (counts[a.type] || 0) + 1
    })
    return counts
  }

  const typeCounts = getTypeCounts()

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030712]">
      {/* Animated Background */}
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
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Explore the <span className="text-gradient">IP Universe</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover and license creative works from talented creators around the world.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            <div className="stat-card">
              <div className="stat-value">{assets.length}</div>
              <div className="stat-label">Total IPs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{typeCounts.music || 0}</div>
              <div className="stat-label">Music Tracks</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{typeCounts.character || 0}</div>
              <div className="stat-label">Characters</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{typeCounts.story || 0}</div>
              <div className="stat-label">Stories</div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-2xl p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by title, artist, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-12"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field w-full lg:w-48 appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Type Filter Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setTypeFilter('all')}
                className={`btn-pill ${typeFilter === 'all' ? 'active' : ''}`}
              >
                All ({typeCounts.all || 0})
              </button>
              {Object.entries(ASSET_TYPE_CONFIG).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type as AssetType)}
                  className={`btn-pill ${typeFilter === type ? 'active' : ''}`}
                >
                  {config.icon} {config.label} ({typeCounts[type] || 0})
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square skeleton rounded-2xl" />
              ))}
            </div>
          ) : filteredAssets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No IPs Found</h3>
              <p className="text-gray-400">Try adjusting your filters or search term.</p>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredAssets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="asset-card cursor-pointer group"
                    onClick={() => {
                      if (asset.type === 'music') {
                        setSelectedTrack(asset)
                      } else {
                        window.open(asset.mediaUrl, '_blank')
                      }
                    }}
                  >
                    {/* Image */}
                    <div className="asset-card-image">
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

                      {/* Type Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`badge badge-${asset.type}`}>
                          {ASSET_TYPE_CONFIG[asset.type].icon} {asset.type}
                        </span>
                      </div>

                      {/* Play Button for Music */}
                      {asset.type === 'music' && (
                        <div className="asset-card-play">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 relative z-10">
                      <h3 className="font-bold text-lg text-white mb-1 truncate group-hover:text-gradient transition-all">
                        {asset.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-3 truncate">by {asset.artist}</p>

                      {asset.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{asset.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <span className="text-primary-400 font-semibold">
                          {asset.price && asset.price !== '0' ? `${asset.price} IP` : 'Free'}
                        </span>
                        {asset.ipId && (
                          <a
                            href={`https://aeneid.explorer.story.foundation/ipa/${asset.ipId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-20 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/10 pointer-events-auto"
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log('View IP clicked for:', asset.ipId)
                            }}
                          >
                            View IP ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* List View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {filteredAssets.map((asset, index) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-panel-hover rounded-2xl p-4 cursor-pointer flex items-center gap-4"
                  onClick={() => {
                    if (asset.type === 'music') {
                      setSelectedTrack(asset)
                    } else {
                      window.open(asset.mediaUrl, '_blank')
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    {asset.coverUrl ? (
                      <img src={asset.coverUrl} alt={asset.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${ASSET_TYPE_CONFIG[asset.type].gradient} flex items-center justify-center`}>
                        <span className="text-3xl">{ASSET_TYPE_CONFIG[asset.type].icon}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white truncate">{asset.title}</h3>
                      <span className={`badge badge-${asset.type} text-xs py-0.5`}>
                        {ASSET_TYPE_CONFIG[asset.type].icon}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">by {asset.artist}</p>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex items-center gap-4">
                    <span className="text-primary-400 font-semibold">
                      {asset.price && asset.price !== '0' ? `${asset.price} IP` : 'Free'}
                    </span>
                    {asset.ipId && (
                      <a
                        href={`https://aeneid.explorer.story.foundation/ipa/${asset.ipId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary py-2 px-4 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View IP ↗
                      </a>
                    )}
                    {asset.type === 'music' && (
                      <button className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    )}
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
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass-panel rounded-3xl p-6 border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="badge badge-music mb-2">
                      {ASSET_TYPE_CONFIG.music.icon} Music
                    </span>
                    <h2 className="text-2xl font-bold text-white">{selectedTrack.title}</h2>
                    <p className="text-gray-400">by {selectedTrack.artist}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTrack(null)}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <MusicPlayer
                  audioUrl={selectedTrack.mediaUrl}
                  title={selectedTrack.title}
                  artist={selectedTrack.artist}
                  imageUrl={selectedTrack.coverUrl}
                />

                {selectedTrack.ipId && (
                  <div className="mt-4 flex justify-center">
                    <a
                      href={`https://aeneid.explorer.story.foundation/ipa/${selectedTrack.ipId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      <span>🔗</span>
                      View on Story Protocol
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}