'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '../components/Navigation'
import Image from 'next/image'
import { useWalletConnection } from '../lib/useWalletConnection'

type GenerationType = 'lyrics' | 'character' | 'story' | 'concept'

interface GenerationOption {
  id: GenerationType
  label: string
  icon: string
  description: string
  gradient: string
  placeholder: string
}

const GENERATION_OPTIONS: GenerationOption[] = [
  {
    id: 'lyrics',
    label: 'Song Lyrics',
    icon: '🎵',
    description: 'Generate original lyrics for your music',
    gradient: 'from-purple-500 to-pink-500',
    placeholder: 'Write a love song about a summer night in Tokyo...'
  },
  {
    id: 'character',
    label: 'Character',
    icon: '🦸',
    description: 'Create unique character profiles',
    gradient: 'from-blue-500 to-cyan-500',
    placeholder: 'A cyberpunk hacker with mysterious past...'
  },
  {
    id: 'story',
    label: 'Story',
    icon: '📚',
    description: 'Generate story outlines and plots',
    gradient: 'from-green-500 to-emerald-500',
    placeholder: 'A sci-fi adventure on Mars in 2150...'
  },
  {
    id: 'concept',
    label: 'Concept',
    icon: '💡',
    description: 'Brainstorm creative ideas',
    gradient: 'from-amber-500 to-orange-500',
    placeholder: 'A game mechanic that combines music and puzzles...'
  },
]

interface GeneratedContent {
  type: GenerationType
  prompt: string
  content: string
  timestamp: Date
  registered: boolean
  ipId?: string
}

export default function AIStudioPage() {
  const { address, isConnected, connectWallet } = useWalletConnection()
  const [selectedType, setSelectedType] = useState<GenerationType>('lyrics')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<GeneratedContent[]>([])
  const [currentGeneration, setCurrentGeneration] = useState<GeneratedContent | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const selectedOption = GENERATION_OPTIONS.find(o => o.id === selectedType)!

  const generateContent = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setGenerating(true)
    setError('')
    setCurrentGeneration(null)

    try {
      // Construct the system prompt based on type
      let systemPrompt = ''
      switch (selectedType) {
        case 'lyrics':
          systemPrompt = `Generate original song lyrics based on this idea. Include verse, chorus, and bridge structure:\n\n"${prompt}"`
          break
        case 'character':
          systemPrompt = `Create a detailed character profile including name, age, appearance, personality, backstory, and special abilities:\n\n"${prompt}"`
          break
        case 'story':
          systemPrompt = `Write a creative story outline with setting, characters, plot points, and ending:\n\n"${prompt}"`
          break
        case 'concept':
          systemPrompt = `Develop this creative concept with detailed description, key features, and potential applications:\n\n"${prompt}"`
          break
      }

      const response = await fetch('/api/perplexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', prompt: systemPrompt }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate content')
      }

      const newGeneration: GeneratedContent = {
        type: selectedType,
        prompt,
        content: data.content,
        timestamp: new Date(),
        registered: false,
      }

      setCurrentGeneration(newGeneration)
      setHistory(prev => [newGeneration, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content')
    } finally {
      setGenerating(false)
    }
  }

  const registerAsIP = async () => {
    if (!currentGeneration || !isConnected) return

    setRegistering(true)
    setError('')

    try {
      // Create metadata for the IP
      const typeLabel = GENERATION_OPTIONS.find(o => o.id === currentGeneration.type)?.label || 'Content'
      const title = `AI ${typeLabel}: ${currentGeneration.prompt.slice(0, 50)}${currentGeneration.prompt.length > 50 ? '...' : ''}`

      // Upload as asset
      const formData = new FormData()

      // Create a text file blob for the content
      const contentBlob = new Blob([currentGeneration.content], { type: 'text/plain' })
      const contentFile = new File([contentBlob], `${currentGeneration.type}-${Date.now()}.txt`, { type: 'text/plain' })

      formData.append('file', contentFile)
      formData.append('title', title)
      formData.append('artist', address || 'Unknown')
      formData.append('description', `AI-generated ${currentGeneration.type} based on: "${currentGeneration.prompt}"`)
      formData.append('price', '0')
      formData.append('owner', address || '')
      formData.append('type', currentGeneration.type)

      const response = await fetch('/api/upload-asset', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        // Update the current generation with IP info
        const updatedGeneration = {
          ...currentGeneration,
          registered: true,
          ipId: data.ipId,
        }
        setCurrentGeneration(updatedGeneration)

        // Update history
        setHistory(prev => prev.map(h =>
          h.timestamp === currentGeneration.timestamp ? updatedGeneration : h
        ))
      } else {
        throw new Error(data.error || 'Failed to register IP')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register as IP')
    } finally {
      setRegistering(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
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

      <Navigation />

      <main className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6">
              <span className="text-xl">🤖</span>
              <span className="text-sm font-medium text-purple-300">Powered by AI + Story Protocol</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              AI <span className="text-gradient">Creative Studio</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Generate unique content with AI and automatically register it as IP on Story Protocol.
              Own your creativity from the moment of creation.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Main Generator Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="glass-panel rounded-3xl p-8 space-y-6">
                {/* Type Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {GENERATION_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedType(option.id)}
                      className={`relative p-4 rounded-xl border transition-all duration-300 group overflow-hidden ${selectedType === option.id
                          ? 'border-white/30 bg-white/10'
                          : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                    >
                      {selectedType === option.id && (
                        <motion.div
                          layoutId="selectedType"
                          className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-20`}
                        />
                      )}
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{option.icon}</span>
                        <span className="text-sm font-medium text-white">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Description */}
                <div className={`p-4 rounded-xl bg-gradient-to-r ${selectedOption.gradient} bg-opacity-10 border border-white/10`}>
                  <p className="text-sm text-gray-300">
                    <span className="text-white font-medium">{selectedOption.icon} {selectedOption.label}:</span>{' '}
                    {selectedOption.description}
                  </p>
                </div>

                {/* Prompt Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Your Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="input-field resize-none"
                    placeholder={selectedOption.placeholder}
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateContent}
                  disabled={generating || !prompt.trim()}
                  className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating with AI...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>✨</span>
                      Generate {selectedOption.label}
                    </span>
                  )}
                </button>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Generated Content */}
                <AnimatePresence mode="wait">
                  {currentGeneration && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <span>{selectedOption.icon}</span>
                          Generated {selectedOption.label}
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(currentGeneration.content)}
                            className="btn-ghost text-sm"
                          >
                            📋 Copy
                          </button>
                        </div>
                      </div>

                      <div className="bg-black/30 rounded-xl p-6 border border-white/5 max-h-80 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm leading-relaxed">
                          {currentGeneration.content}
                        </pre>
                      </div>

                      {/* Register as IP CTA */}
                      {!currentGeneration.registered ? (
                        <div className="featured-card">
                          <div className="featured-card-inner p-6">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <h4 className="text-lg font-bold text-white mb-1">
                                  🎉 Register as IP on Story Protocol
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Protect your AI-generated content with on-chain ownership.
                                </p>
                              </div>
                              {isConnected ? (
                                <button
                                  onClick={registerAsIP}
                                  disabled={registering}
                                  className="btn-accent whitespace-nowrap"
                                >
                                  {registering ? (
                                    <span className="flex items-center gap-2">
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      Registering...
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-2">
                                      <span>⚡</span>
                                      Register IP
                                    </span>
                                  )}
                                </button>
                              ) : (
                                <button onClick={connectWallet} className="btn-primary">
                                  Connect Wallet
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center"
                        >
                          <div className="text-4xl mb-2">🎉</div>
                          <h4 className="text-lg font-bold text-green-400 mb-2">
                            Successfully Registered as IP!
                          </h4>
                          <p className="text-sm text-gray-400 mb-4">
                            Your content is now protected on Story Protocol.
                          </p>
                          {currentGeneration.ipId && (
                            <a
                              href={`https://aeneid.explorer.story.foundation/ipa/${currentGeneration.ipId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary"
                            >
                              View on Story Explorer ↗
                            </a>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* How It Works */}
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>🚀</span> How It Works
                </h3>
                <div className="space-y-4">
                  {[
                    { step: '1', title: 'Describe Your Idea', desc: 'Enter a prompt for the AI' },
                    { step: '2', title: 'AI Generates', desc: 'Unique content created instantly' },
                    { step: '3', title: 'Register as IP', desc: 'One-click protection on Story' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>💎</span> Why Register AI Content?
                </h3>
                <ul className="space-y-3 text-sm">
                  {[
                    'Prove ownership with blockchain timestamp',
                    'Earn royalties when others remix',
                    'Track usage and derivatives',
                    'License your IP globally',
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-400">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent History */}
              {history.length > 0 && (
                <div className="glass-panel rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>📜</span> Recent
                    </h3>
                    <span className="text-xs text-gray-500">{history.length} items</span>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {history.slice(0, 5).map((item, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => setCurrentGeneration(item)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-400">
                            {GENERATION_OPTIONS.find(o => o.id === item.type)?.icon} {item.type}
                          </span>
                          {item.registered && (
                            <span className="badge badge-success text-xs py-0.5">✓ IP</span>
                          )}
                        </div>
                        <p className="text-sm text-white truncate">{item.prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}