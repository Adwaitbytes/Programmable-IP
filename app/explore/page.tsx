'use client'

import { useEffect, useState } from 'react'
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
  textContent?: string
}

const FILTER_TABS: { id: AssetType | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Assets', icon: '🌐' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'character', label: 'Characters', icon: '🦸' },
  { id: 'story', label: 'Stories', icon: '📚' },
  { id: 'image', label: 'Art', icon: '🎨' },
  { id: 'concept', label: 'Concepts', icon: '💡' },
]

export default function ExplorePage() {
  const [assets, setAssets] = useState<AssetData[]>([])
  const [filteredAssets, setFilteredAssets] = useState<AssetData[]>([])
  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all')
  const [selectedTrack, setSelectedTrack] = useState<AssetData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/get-assets')
      const data = await res.json()
      if (data.success) {
        const visibleAssets = (data.assets || []).filter((asset: AssetData) => !asset.hidden)
        setAssets(visibleAssets)
        setFilteredAssets(visibleAssets)
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  useEffect(() => {
    if (selectedType === 'all') {
      setFilteredAssets(assets)
    } else {
      setFilteredAssets(assets.filter(asset => asset.type === selectedType))
    }
  }, [selectedType, assets])

  const handleAssetClick = (asset: AssetData) => {
    if (asset.type === 'music') {
      setSelectedTrack(asset)
    } else if (asset.type === 'story' && asset.textContent) {
      alert(`Story Content:\n\n${asset.textContent}`)
    } else {
      window.open(asset.mediaUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-story-dark selection:bg-blue-500/30">
      <Navigation />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-1/2 translate-x-1/2 w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
      </div>

      <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white text-glow">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">IP Universe</span>
            </h1>
            <p className="text-story-text-secondary text-lg max-w-2xl mx-auto mb-8">
              Discover unique characters, stories, music, and art registered on Story Protocol.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {FILTER_TABS.map((tab) => (
                <button key={tab.id} onClick={() => setSelectedType(tab.id)} className={`px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${selectedType === tab.id ? 'bg-white text-black shadow-lg shadow-white/20 scale-105' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="glass-panel rounded-3xl p-16 text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-4">🌌</div>
              <p className="text-story-text-secondary text-lg">No assets found in this category. Be the first to create one!</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAssets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-panel rounded-2xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-300"
                    onClick={() => handleAssetClick(asset)}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      {asset.coverUrl ? (
                        <img src={asset.coverUrl} alt={asset.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center">
                          <span className="text-6xl">{FILTER_TABS.find(t => t.id === asset.type)?.icon || '📄'}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-xs font-medium text-white border border-white/10">
                        {FILTER_TABS.find(t => t.id === asset.type)?.icon} {asset.type}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-lg mb-1 truncate">{asset.title}</h3>
                      <p className="text-story-text-secondary text-sm mb-2 truncate">{asset.artist}</p>
                      <p className="text-gray-400 text-xs line-clamp-2 mb-3">{asset.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                        <span className="text-blue-400 font-medium">{asset.price && asset.price !== '0' ? `${asset.price} IP` : 'Free'}</span>
                        {asset.ipId && (
                          <a
                            href={`https://aeneid.explorer.story.foundation/ipa/${asset.ipId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-20 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/10 pointer-events-auto cursor-pointer"
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
              </div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedTrack && selectedTrack.type === 'music' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTrack(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
              <MusicPlayer audioUrl={selectedTrack.mediaUrl} title={selectedTrack.title} artist={selectedTrack.artist} imageUrl={selectedTrack.coverUrl} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}