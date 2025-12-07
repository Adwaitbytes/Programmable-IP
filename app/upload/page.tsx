'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navigation from '../components/Navigation'
import { useWalletConnection } from '../lib/useWalletConnection'

type AssetType = 'music' | 'character' | 'story' | 'image' | 'concept'

interface AssetTypeConfig {
  id: AssetType
  label: string
  icon: string
  description: string
  gradient: string
  acceptedFiles: string
  fileHint: string
}

const ASSET_TYPES: AssetTypeConfig[] = [
  {
    id: 'music',
    label: 'Music',
    icon: '🎵',
    description: 'Tracks, stems, or soundscapes',
    gradient: 'from-purple-500 to-pink-500',
    acceptedFiles: 'audio/*',
    fileHint: 'MP3, WAV, FLAC'
  },
  {
    id: 'character',
    label: 'Character',
    icon: '🦸',
    description: 'Character designs and profiles',
    gradient: 'from-blue-500 to-cyan-500',
    acceptedFiles: 'image/*',
    fileHint: 'PNG, JPG, WEBP'
  },
  {
    id: 'story',
    label: 'Story',
    icon: '📚',
    description: 'Stories, scripts, or lore',
    gradient: 'from-green-500 to-emerald-500',
    acceptedFiles: '.pdf,.txt,.doc,.docx',
    fileHint: 'PDF, TXT, DOC'
  },
  {
    id: 'image',
    label: 'Art',
    icon: '🎨',
    description: 'Digital art and illustrations',
    gradient: 'from-orange-500 to-amber-500',
    acceptedFiles: 'image/*',
    fileHint: 'PNG, JPG, WEBP'
  },
  {
    id: 'concept',
    label: 'Concept',
    icon: '💡',
    description: 'Ideas, drafts, and proposals',
    gradient: 'from-cyan-500 to-teal-500',
    acceptedFiles: '*/*',
    fileHint: 'Any file type'
  },
]

export default function UploadPage() {
  const router = useRouter()
  const { address, isConnected, connectWallet } = useWalletConnection()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [step, setStep] = useState(1)

  // Form states
  const [selectedType, setSelectedType] = useState<AssetType>('music')
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const selectedTypeConfig = ASSET_TYPES.find(t => t.id === selectedType)!

  const handleMediaChange = (file: File) => {
    setMediaFile(file)
    if (file.type.startsWith('image/') || file.type.startsWith('audio/')) {
      setMediaPreview(URL.createObjectURL(file))
    }
  }

  const handleCoverChange = (file: File) => {
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent, type: 'media' | 'cover') => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      if (type === 'media') handleMediaChange(file)
      else handleCoverChange(file)
    }
  }

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

      const response = await fetch('/api/upload-asset', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setStep(3) // Success step
        setTimeout(() => router.push('/explore'), 3000)
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
    setTimeout(() => setMessage(''), 5000)
  }

  const canProceed = step === 1 || (step === 2 && title && artist && mediaFile)

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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Register Your <span className="text-gradient">IP</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Upload your creative work and protect it on Story Protocol in minutes.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center mb-12"
          >
            {['Select Type', 'Details', 'Complete'].map((label, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step > i + 1 ? 'bg-green-500/20 text-green-400' :
                    step === i + 1 ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30' :
                      'bg-white/5 text-gray-500'
                  }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? 'bg-green-500 text-white' :
                      step === i + 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                        'bg-white/10'
                    }`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </span>
                  <span className="text-sm font-medium hidden sm:inline">{label}</span>
                </div>
                {i < 2 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > i + 1 ? 'bg-green-500' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </motion.div>

          {!isConnected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-12 text-center max-w-xl mx-auto"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl mb-6">
                🔐
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-8">
                You need to connect your wallet to register IP assets on Story Protocol.
              </p>
              <button onClick={connectWallet} className="btn-primary text-lg px-8 py-4">
                <span>🦊</span>
                Connect Wallet
              </button>
            </motion.div>
          ) : step === 3 ? (
            // Success Step
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-3xl p-12 text-center max-w-xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-5xl mb-6"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">IP Registered!</h2>
              <p className="text-gray-400 mb-6">
                Your creative work is now protected on Story Protocol.
              </p>
              <p className="text-sm text-gray-500">Redirecting to explore page...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Step 1: Type Selection */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="glass-panel rounded-3xl p-8">
                      <h2 className="text-xl font-bold text-white mb-6">What are you registering?</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {ASSET_TYPES.map((type) => (
                          <motion.button
                            key={type.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedType(type.id)}
                            className={`relative p-5 rounded-2xl border transition-all text-center group overflow-hidden ${selectedType === type.id
                                ? 'border-white/30 bg-white/10'
                                : 'border-white/5 bg-white/5 hover:border-white/20'
                              }`}
                          >
                            {selectedType === type.id && (
                              <motion.div
                                layoutId="selectedBg"
                                className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-20`}
                              />
                            )}
                            <div className="relative z-10">
                              <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{type.icon}</span>
                              <span className="text-sm font-bold text-white block">{type.label}</span>
                              <span className="text-xs text-gray-500 block mt-1">{type.description}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      <div className="flex justify-end mt-8">
                        <button onClick={() => setStep(2)} className="btn-primary">
                          Continue with {selectedTypeConfig.icon} {selectedTypeConfig.label}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <form onSubmit={handleUpload} className="glass-panel rounded-3xl p-8 space-y-8">
                      {/* Header */}
                      <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedTypeConfig.gradient} flex items-center justify-center text-2xl`}>
                          {selectedTypeConfig.icon}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            Register {selectedTypeConfig.label}
                          </h2>
                          <p className="text-gray-400 text-sm">Fill in the details below</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="ml-auto btn-ghost text-sm"
                        >
                          ← Change type
                        </button>
                      </div>

                      {/* Title & Artist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="input-label">Title <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="input-field"
                            placeholder={`Enter ${selectedType} title`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="input-label">Creator <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            required
                            className="input-field"
                            placeholder="Your name or pseudonym"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <label className="input-label">Description</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="input-field resize-none"
                          placeholder={`Describe your ${selectedType}...`}
                        />
                      </div>

                      {/* File Uploads */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Main File */}
                        <div className="space-y-2">
                          <label className="input-label">Main File <span className="text-red-400">*</span></label>
                          <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => handleDrop(e, 'media')}
                            className={`file-upload ${isDragging ? 'dragover' : ''}`}
                          >
                            <input
                              type="file"
                              accept={selectedTypeConfig.acceptedFiles}
                              onChange={(e) => e.target.files?.[0] && handleMediaChange(e.target.files[0])}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {mediaFile ? (
                              <div className="text-center">
                                <span className="text-2xl">✅</span>
                                <p className="text-sm text-white mt-2">{mediaFile.name}</p>
                                <p className="text-xs text-gray-500">{(mediaFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            ) : (
                              <>
                                <span className="text-3xl">{selectedTypeConfig.icon}</span>
                                <p className="text-sm text-gray-400 mt-2">Drop file or click to upload</p>
                                <p className="text-xs text-gray-500">{selectedTypeConfig.fileHint}</p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Cover Image */}
                        <div className="space-y-2">
                          <label className="input-label">Cover Image</label>
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, 'cover')}
                            className="file-upload"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleCoverChange(e.target.files[0])}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {coverPreview ? (
                              <img src={coverPreview} alt="Cover" className="w-24 h-24 object-cover rounded-xl" />
                            ) : (
                              <>
                                <span className="text-3xl">🖼️</span>
                                <p className="text-sm text-gray-400 mt-2">Cover image</p>
                                <p className="text-xs text-gray-500">PNG, JPG</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Preview */}
                      {mediaPreview && selectedType === 'music' && (
                        <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                          <audio controls className="w-full" src={mediaPreview} />
                        </div>
                      )}

                      {/* Price */}
                      <div className="space-y-2">
                        <label className="input-label">License Price (optional)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.001"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="input-field pr-16"
                            placeholder="0.00"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                            IP
                          </span>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <button type="button" onClick={() => setStep(1)} className="btn-ghost">
                          ← Back
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={loading || !title || !artist || !mediaFile}
                          className="btn-primary text-lg px-8 py-4 disabled:opacity-50"
                        >
                          {loading ? (
                            <span className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Registering on Story Protocol...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <span>🚀</span>
                              Register IP
                            </span>
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border z-50 ${messageType === 'success'
                ? 'bg-green-500/20 border-green-500/30 text-green-200'
                : 'bg-red-500/20 border-red-500/30 text-red-200'
              }`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}