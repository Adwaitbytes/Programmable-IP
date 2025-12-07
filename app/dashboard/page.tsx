'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
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
  views?: number // Assuming views might be tracked in the future
}

interface UserStats {
  totalAssets: number
  totalEarnings: number // Placeholder for now
  assetBreakdown: Record<AssetType, number>
  recentUploads: AssetData[]
}

export default function DashboardPage() {
  const { address, isConnected, connectWallet } = useWalletConnection()
  const [stats, setStats] = useState<UserStats>({
    totalAssets: 0,
    totalEarnings: 0,
    assetBreakdown: { music: 0, character: 0, story: 0, image: 0, concept: 0, other: 0 },
    recentUploads: []
  })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  // Use wallet hook values
  const account = address || ''
  const connected = isConnected

  useEffect(() => {
    if (connected && account) {
      loadUserStats(account)
    }
    setLoading(false)
  }, [connected, account])

  const loadUserStats = async (userAddress: string) => {
    try {
      const response = await fetch('/api/get-assets')
      const data = await response.json()

      if (data.success) {
        const userAssets = (data.assets || []).filter((item: AssetData) =>
          item.owner.toLowerCase() === userAddress.toLowerCase()
        )

        // Calculate stats
        const totalAssets = userAssets.length
        const totalEarnings = userAssets.reduce((sum: number, item: AssetData) =>
          sum + (parseFloat(item.price) || 0), 0
        )

        const assetBreakdown = userAssets.reduce((acc: Record<string, number>, item: AssetData) => {
          acc[item.type] = (acc[item.type] || 0) + 1
          return acc
        }, { music: 0, character: 0, story: 0, image: 0, concept: 0, other: 0 })

        // Get recent uploads
        const recentUploads = userAssets
          .sort((a: AssetData, b: AssetData) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5)

        setStats({
          totalAssets,
          totalEarnings,
          assetBreakdown,
          recentUploads
        })
      }
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/delete-music?id=${id}&owner=${account}`, { // Note: Should ideally be delete-asset
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        alert(`✅ Successfully deleted "${title}"`)
        // Refresh the stats
        loadUserStats(account)
      } else {
        alert(`❌ Failed to delete: ${data.error}`)
      }
    } catch (error) {
      alert(`❌ Error deleting asset: ${error}`)
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
        alert(`✅ ${data.hidden ? 'Hidden from explore page' : 'Now visible on explore page'}: "${title}"`)
        // Refresh the stats
        loadUserStats(account)
      } else {
        alert(`❌ Failed to ${action}: ${data.error}`)
      }
    } catch (error) {
      alert(`❌ Error toggling visibility: ${error}`)
    } finally {
      setToggling(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-story-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-story-dark selection:bg-blue-500/30">
        <Navigation />

        {/* Background Glow Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
        </div>

        <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-12 shadow-2xl"
            >
              <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-8">
                <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-6 text-white text-glow">
                Connect Your Wallet
              </h1>
              <p className="text-story-text-secondary text-lg mb-8 max-w-md mx-auto">
                Connect your wallet to access your dashboard, view stats, and manage your IP assets.
              </p>
              <button
                onClick={connectWallet}
                className="btn-primary px-8 py-3 text-lg"
              >
                Connect Wallet
              </button>
            </motion.div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-story-dark selection:bg-blue-500/30">
      <Navigation />

      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
      </div>

      <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white text-glow mb-2">
                  Dashboard
                </h1>
                <p className="text-story-text-secondary">
                  Manage your IP assets and view performance stats
                </p>
              </div>
              <Link
                href="/upload"
                className="btn-primary px-6 py-3 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Register New IP
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-24 h-24 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-story-text-secondary font-medium mb-2">
                  Total Assets
                </h3>
                <p className="text-4xl font-bold text-white">
                  {stats.totalAssets}
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-24 h-24 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-story-text-secondary font-medium mb-2">
                  Asset Types
                </h3>
                <div className="flex gap-3 mt-2">
                  {Object.entries(stats.assetBreakdown).map(([type, count]) => (
                    count > 0 && (
                      <div key={type} className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 capitalize">{type}</span>
                        <span className="text-lg font-bold text-white">{count}</span>
                      </div>
                    )
                  ))}
                  {stats.totalAssets === 0 && <span className="text-gray-500">None</span>}
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-24 h-24 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.93V17a1 1 0 11-2 0v-.07A7.003 7.003 0 015 10a1 1 0 012 0 5 5 0 105 5 1 1 0 012 0 7.003 7.003 0 01-1 6.93z" />
                  </svg>
                </div>
                <h3 className="text-story-text-secondary font-medium mb-2">
                  Total Value
                </h3>
                <p className="text-4xl font-bold text-white">
                  {stats.totalEarnings} <span className="text-lg text-story-text-secondary font-normal">IP</span>
                </p>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">
                  Recent Uploads
                </h2>
              </div>

              {stats.recentUploads.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-story-text-secondary text-lg mb-6">
                    No assets registered yet
                  </p>
                  <Link href="/upload" className="btn-secondary">
                    Register Your First Asset
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="px-6 py-4 text-left text-xs font-medium text-story-text-secondary uppercase tracking-wider">
                          Asset
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-story-text-secondary uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-story-text-secondary uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-story-text-secondary uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-story-text-secondary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats.recentUploads.map((upload) => (
                        <tr key={upload.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-black/20">
                                <img
                                  className="h-10 w-10 object-cover"
                                  src={upload.coverUrl || upload.mediaUrl}
                                  alt=""
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Asset'
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{upload.title}</div>
                                <div className="text-sm text-story-text-secondary">{upload.artist}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                              {upload.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-story-text-secondary">
                            {new Date(upload.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {upload.hidden ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                🔒 Hidden
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                👁️ Visible
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                            <a
                              href={`https://aeneid.explorer.story.foundation/ipa/${upload.ipId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors inline-block"
                            >
                              View ↗
                            </a>
                            <button
                              onClick={() => handleToggleHide(upload.id, upload.title, upload.hidden || false)}
                              disabled={toggling === upload.id}
                              className="text-yellow-400 hover:text-yellow-300 disabled:text-gray-600 transition-colors inline-block"
                            >
                              {toggling === upload.id ? '...' : (upload.hidden ? 'Show' : 'Hide')}
                            </button>
                            <button
                              onClick={() => handleDelete(upload.id, upload.title)}
                              disabled={deleting === upload.id}
                              className="text-red-400 hover:text-red-300 disabled:text-gray-600 transition-colors inline-block"
                            >
                              {deleting === upload.id ? '...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/ai"
                className="glass-panel rounded-2xl p-6 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      AI Creative Assistant
                    </h3>
                    <p className="text-sm text-story-text-secondary">
                      Generate ideas, stories, and art
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-purple-400 text-sm font-medium">
                  Try it out <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>

              <Link
                href="/explore"
                className="glass-panel rounded-2xl p-6 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Explore IP Universe
                    </h3>
                    <p className="text-sm text-story-text-secondary">
                      Discover new creative works
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-blue-400 text-sm font-medium">
                  Browse now <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}