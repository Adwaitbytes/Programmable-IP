'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navigation from '../components/Navigation'
import { useWalletConnection } from '../lib/useWalletConnection'

type AssetType = 'music' | 'character' | 'story' | 'image' | 'concept'

const ASSET_TYPES: { id: AssetType; label: string; icon: string; description: string }[] = [
  { id: 'music', label: 'Music', icon: '🎵', description: 'Upload tracks, stems, or soundscapes' },
  { id: 'character', label: 'Character', icon: '🦸', description: 'Register character designs and traits' },
  { id: 'story', label: 'Story', icon: '📚', description: 'Short stories, scripts, or lore' },
  { id: 'image', label: 'Art', icon: '🎨', description: 'Digital art, illustrations, or designs' },
  { id: 'concept', label: 'Concept', icon: '💡', description: 'Early ideas, drafts, and proposals' },
]

export default function UploadPage() {
  const router = useRouter()
  const { address, isConnected, connectWallet } = useWalletConnection()
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // Form states
  const [selectedType, setSelectedType] = useState<AssetType>('music')
  const [title, setTitle] = useState<string>('')
  const [artist, setArtist] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string>('')
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [textContent, setTextContent] = useState<string>('')
  const [attributes, setAttributes] = useState<Record<string, string>>({})

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet()
      showMessage('Wallet connected successfully!', 'success')
    } catch (error) {
      showMessage('Failed to connect wallet', 'error')
    }
  }

  // Handle file changes
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)
      // Create preview based on type
      if (file.type.startsWith('image/') || file.type.startsWith('audio/')) {
        setMediaPreview(URL.createObjectURL(file))
      }
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  // Upload asset and register IP
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      showMessage('Please connect your wallet first', 'error')
      return
    }

    if (!title || !artist || !mediaFile) {
      showMessage('Please fill in all required fields', 'error')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('type', selectedType)
      formData.append('title', title)
      formData.append('artist', artist)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('owner', address || '')
      formData.append('mediaFile', mediaFile)

      if (coverFile) {
        formData.append('coverFile', coverFile)
      }

      if (textContent) {
        formData.append('textContent', textContent)
      }

      if (Object.keys(attributes).length > 0) {
        formData.append('attributes', JSON.stringify(attributes))
      }

      const response = await fetch('/api/upload-asset', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        showMessage(
          `Asset uploaded and IP registered successfully! IP ID: ${data.ipId}`,
          'success'
        )

        // Reset form
        setTitle('')
        setArtist('')
        setDescription('')
        setPrice('')
        setMediaFile(null)
        setCoverFile(null)
        setMediaPreview('')
        setCoverPreview('')
        setTextContent('')
        setAttributes({})

        // Redirect to explore page after 2 seconds
        setTimeout(() => {
          router.push('/explore')
        }, 2000)
      } else {
        showMessage(data.error || 'Upload failed', 'error')
      }
    } catch (error) {
      showMessage('Upload failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 8000)
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
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-glow">
              Register Your IP
            </h1>
            <p className="text-story-text-secondary text-lg max-w-2xl mx-auto">
              Upload your creative works to Story Protocol. From music to characters, protect and monetize your intellectual property.
            </p>
          </motion.div>

          {!isConnected ? (
            <div className="glass-panel rounded-3xl p-16 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-8">
                <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.59-4.18" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h3>
              <p className="text-story-text-secondary mb-8">
                Connect your wallet to start uploading and registering IP assets.
              </p>
              <button onClick={handleConnectWallet} className="btn-primary px-8 py-3">
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Asset Type Selection */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {ASSET_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`relative p-4 rounded-2xl border transition-all duration-300 text-left group ${selectedType === type.id
                        ? 'bg-white/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                      }`}
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{type.icon}</div>
                    <div className={`font-bold mb-1 ${selectedType === type.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      {type.label}
                    </div>
                    <div className="text-xs text-story-text-secondary line-clamp-2">
                      {type.description}
                    </div>
                    {selectedType === type.id && (
                      <motion.div
                        layoutId="activeType"
                        className="absolute inset-0 border-2 border-blue-500/50 rounded-2xl"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Upload Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedType}
                className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl"
              >
                <form onSubmit={handleUpload} className="space-y-8">
                  <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
                      {ASSET_TYPES.find(t => t.id === selectedType)?.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Upload {ASSET_TYPES.find(t => t.id === selectedType)?.label}
                      </h2>
                      <p className="text-story-text-secondary text-sm">
                        Fill in the details to register your {selectedType} IP.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 ml-1">
                        Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        placeholder={`Enter ${selectedType} title`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 ml-1">
                        Creator / Artist <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        placeholder="Enter creator name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 ml-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                      placeholder={`Describe your ${selectedType}...`}
                    />
                  </div>

                  {/* Dynamic Fields based on Type */}
                  {selectedType === 'story' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 ml-1">
                        Story Content / Synopsis
                      </label>
                      <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                        placeholder="Write your story or synopsis here..."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 ml-1">
                        Main Asset File <span className="text-red-400">*</span>
                      </label>
                      <div className="relative group">
                        <input
                          type="file"
                          accept={selectedType === 'music' ? 'audio/*' : selectedType === 'image' ? 'image/*' : selectedType === 'story' ? '.pdf,.txt,.doc,.docx' : '*/*'}
                          onChange={handleMediaChange}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer"
                        />
                        {mediaPreview && (selectedType === 'music' || selectedType === 'image') && (
                          <div className="mt-4 p-3 rounded-xl bg-black/20 border border-white/5">
                            {selectedType === 'music' ? (
                              <audio controls className="w-full h-8" src={mediaPreview} />
                            ) : (
                              <img src={mediaPreview} alt="Preview" className="w-full h-48 object-contain rounded-lg" />
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-story-text-secondary ml-1">
                        {selectedType === 'music' ? 'MP3, WAV, FLAC' : selectedType === 'image' ? 'PNG, JPG, WEBP' : 'PDF, TXT, DOC'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 ml-1">
                        Cover Image {selectedType === 'image' ? '(Optional)' : ''}
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-all cursor-pointer"
                        />
                        {coverPreview && (
                          <div className="mt-4 relative aspect-square w-32 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                            <img
                              src={coverPreview}
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 ml-1">
                      License Price (IP Tokens)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        placeholder="0.00"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                        IP
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary py-4 text-lg font-semibold shadow-lg shadow-blue-500/20"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Registering IP Asset...
                        </span>
                      ) : (
                        `🚀 Register ${selectedType} IP`
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      </main>

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