'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from './components/Navigation'
import MusicPlayer from './components/MusicPlayer'
import Link from 'next/link'
import { useWalletConnection } from './lib/useWalletConnection'

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

const ASSET_TYPE_ICONS: Record<AssetType, string> = {
  music: '🎵',
  character: '🦸',
  story: '📚',
  image: '🎨',
  concept: '💡',
  other: '📄',
}

const ASSET_TYPE_COLORS: Record<AssetType, string> = {
  music: 'from-purple-500 to-pink-500',
  character: 'from-blue-500 to-indigo-500',
  story: 'from-green-500 to-emerald-500',
  image: 'from-orange-500 to-amber-500',
  concept: 'from-cyan-500 to-teal-500',
  other: 'from-gray-500 to-slate-500',
}

const FEATURES = [
  {
    icon: '🚀',
    title: 'One-Click IP Registration',
    description: 'Register any creative work as programmable IP on Story Protocol in seconds.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Creation',
    description: 'Generate stories, characters, and concepts with AI and auto-register as IP.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: '💰',
    title: 'Automatic Royalties',
    description: 'Earn royalties automatically when your IP is remixed or licensed.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: '🔗',
    title: 'On-Chain Provenance',
    description: 'Immutable proof of ownership stored forever on the blockchain.',
    gradient: 'from-green-500 to-emerald-500',
  },
]

const STATS = [
  { value: '10K+', label: 'IPs Registered', icon: '📜' },
  { value: '5K+', label: 'Creators', icon: '👥' },
  { value: '$50K+', label: 'Royalties Paid', icon: '💎' },
  { value: '100%', label: 'On-Chain', icon: '⛓️' },
]

export default function Home() {
  const { address, isConnected, isMobile, connectWallet } = useWalletConnection()
  const [featuredAssets, setFeaturedAssets] = useState<AssetData[]>([])
  const [selectedTrack, setSelectedTrack] = useState<AssetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalAssets, setTotalAssets] = useState(0)
  const [uniqueCreators, setUniqueCreators] = useState(0)

  useEffect(() => {
    fetchFeaturedAssets()
  }, [])

  const fetchFeaturedAssets = async () => {
    try {
      const res = await fetch('/api/get-assets')
      const data = await res.json()
      if (data.success) {
        const assets = data.assets || []
        const visible = assets.filter((a: AssetData) => !a.hidden)
        setFeaturedAssets(visible.slice(0, 6))
        setTotalAssets(visible.length)
        setUniqueCreators(new Set(visible.map((a: AssetData) => a.owner.toLowerCase())).size)
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030712]">
      {/* Animated Background */}
      <div className="bg-animated-gradient">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-grid" />
      <div className="bg-noise" />

      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-300">
                Powered by <span className="text-gradient font-semibold">Story Protocol</span>
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="text-white">The Future of</span>
              <br />
              <span className="text-gradient">Creative IP</span>
              <span className="text-white"> is Here</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Register your music, characters, stories, and art as programmable IP.
              Earn royalties automatically. Own your creativity forever.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {!isConnected ? (
                <button onClick={connectWallet} className="btn-primary text-lg px-8 py-4">
                  <span className="text-xl">{isMobile ? '📱' : '🦊'}</span>
                  Connect Wallet
                </button>
              ) : (
                <Link href="/upload" className="btn-primary text-lg px-8 py-4">
                  <span className="text-xl">✨</span>
                  Register Your IP
                </Link>
              )}
              <Link href="/explore" className="btn-secondary text-lg px-8 py-4">
                <span className="text-xl">🌐</span>
                Explore IP Universe
              </Link>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-8 mt-16"
            >
              {STATS.map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-2xl">{stat.icon}</div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Floating Asset Cards Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="flex justify-center gap-4 overflow-hidden px-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="w-64 h-80 skeleton rounded-2xl" />
                ))
              ) : featuredAssets.slice(0, 3).length > 0 ? (
                featuredAssets.slice(0, 3).map((asset, i) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className={`w-64 flex-shrink-0 glass-card overflow-hidden cursor-pointer hover-lift ${i === 1 ? 'scale-110 z-20' : 'opacity-80'}`}
                    onClick={() => asset.type === 'music' && setSelectedTrack(asset)}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      {asset.coverUrl ? (
                        <img src={asset.coverUrl} alt={asset.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${ASSET_TYPE_COLORS[asset.type]} flex items-center justify-center`}>
                          <span className="text-6xl">{ASSET_TYPE_ICONS[asset.type]}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className={`badge badge-${asset.type}`}>
                          {ASSET_TYPE_ICONS[asset.type]} {asset.type}
                        </span>
                      </div>
                      {asset.type === 'music' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white truncate">{asset.title}</h3>
                      <p className="text-sm text-gray-400 truncate">by {asset.artist}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-20">
                  <p>No IPs registered yet. Be the first!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose <span className="text-gradient">Melodex</span>?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The most intuitive platform for registering and managing your creative IP on Story Protocol.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-panel-hover rounded-2xl p-6 group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Register IP in <span className="text-gradient-accent">3 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload Your Work', desc: 'Upload music, art, stories, or any creative content you want to protect.', icon: '📤' },
              { step: '02', title: 'Set License Terms', desc: 'Choose royalty rates, licensing options, and commercial terms.', icon: '⚖️' },
              { step: '03', title: 'Register on Story', desc: 'One click to register your IP on-chain with full provenance.', icon: '✅' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative text-center"
              >
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="text-6xl font-bold text-gradient opacity-20 absolute top-0 right-0">{item.step}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 right-0 translate-x-1/2 w-16 h-[2px] bg-gradient-to-r from-purple-500 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/upload" className="btn-primary text-lg px-8 py-4">
              Start Now — It's Free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured IPs Section */}
      {featuredAssets.length > 0 && (
        <section className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-12"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Featured IPs</h2>
                <p className="text-gray-400">Discover the latest registered intellectual properties</p>
              </div>
              <Link href="/explore" className="btn-ghost text-primary-400">
                View All →
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAssets.map((asset, i) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="asset-card cursor-pointer"
                  onClick={() => asset.type === 'music' ? setSelectedTrack(asset) : window.open(asset.mediaUrl, '_blank')}
                >
                  <div className="asset-card-image">
                    {asset.coverUrl ? (
                      <img src={asset.coverUrl} alt={asset.title} />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${ASSET_TYPE_COLORS[asset.type]} flex items-center justify-center`}>
                        <span className="text-7xl">{ASSET_TYPE_ICONS[asset.type]}</span>
                      </div>
                    )}
                    <div className="asset-card-overlay" />
                    <div className="absolute top-3 right-3">
                      <span className={`badge badge-${asset.type}`}>
                        {ASSET_TYPE_ICONS[asset.type]} {asset.type}
                      </span>
                    </div>
                    {asset.type === 'music' && <div className="asset-card-play">▶</div>}
                  </div>
                  <div className="p-5 relative z-10">
                    <h3 className="font-bold text-lg text-white mb-1 truncate">{asset.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">by {asset.artist}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-primary-400 font-medium">
                        {asset.price && asset.price !== '0' ? `${asset.price} IP` : 'Free'}
                      </span>
                      {asset.ipId && (
                        <a
                          href={`https://aeneid.explorer.story.foundation/ipa/${asset.ipId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-20 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/10 pointer-events-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View IP ↗
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AI Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="featured-card"
          >
            <div className="featured-card-inner p-8 sm:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="featured-badge mb-4">
                    <span className="animate-pulse">✨</span> New Feature
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-4">
                    AI-Powered <span className="text-gradient">IP Creation</span>
                  </h2>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    Generate stories, characters, and creative concepts with AI.
                    Every output is automatically registered as IP on Story Protocol
                    with full provenance and ownership rights.
                  </p>
                  <Link href="/ai" className="btn-accent">
                    <span>🤖</span>
                    Try AI Assistant
                  </Link>
                </div>
                <div className="relative">
                  <div className="glass-panel rounded-2xl p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">🤖</div>
                      <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-4">
                        <p className="text-sm text-gray-300">Create a cyberpunk hero character with electric blue powers...</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 justify-end">
                      <div className="flex-1 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl rounded-tr-none p-4 border border-purple-500/20">
                        <p className="text-sm text-gray-300">✨ Generating character...</p>
                        <p className="text-xs text-purple-400 mt-2">→ Auto-registering on Story Protocol</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-sm">⚡</div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to <span className="text-gradient">Own Your Creativity</span>?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join thousands of creators protecting their intellectual property on Story Protocol.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isConnected ? (
                <button onClick={connectWallet} className="btn-primary text-lg px-8 py-4">
                  Get Started — Connect Wallet
                </button>
              ) : (
                <Link href="/upload" className="btn-primary text-lg px-8 py-4">
                  Register Your First IP
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">🎵</div>
            <span className="text-xl font-bold text-white">Melodex</span>
          </div>
          <p className="text-gray-500 text-sm">
            Built with ❤️ for Story Protocol • © 2025 Melodex
          </p>
          <div className="flex items-center gap-6">
            <a href="https://story.foundation" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">
              Story Protocol
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">
              GitHub
            </a>
          </div>
        </div>
      </footer>

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
    </div>
  )
}
