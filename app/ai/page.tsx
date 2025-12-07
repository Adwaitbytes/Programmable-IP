'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import Image from 'next/image'

type GenerationType = 'lyrics' | 'image' | 'story' | 'character'

const GENERATION_OPTIONS: { id: GenerationType; label: string; icon: string; description: string }[] = [
  { id: 'lyrics', label: 'Song Lyrics', icon: '🎵', description: 'Generate lyrics for your next hit' },
  { id: 'image', label: 'Visual Art', icon: '🎨', description: 'Create album art or character designs' },
  { id: 'story', label: 'Story Outline', icon: '📚', description: 'Plot outlines and narrative arcs' },
  { id: 'character', label: 'Character Profile', icon: '🦸', description: 'Detailed character backstories and traits' },
]

export default function AIPage() {
  const [selectedType, setSelectedType] = useState<GenerationType>('lyrics')
  const [prompt, setPrompt] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  const generateContent = async () => {
    if (!prompt) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError('')
    setGeneratedContent('')
    setGeneratedImage('')

    try {
      // Construct a specific prompt based on type
      let systemPrompt = ''
      if (selectedType === 'lyrics') systemPrompt = `Generate song lyrics based on this idea: "${prompt}"`
      else if (selectedType === 'story') systemPrompt = `Write a creative story outline or synopsis based on: "${prompt}"`
      else if (selectedType === 'character') systemPrompt = `Create a detailed character profile (name, age, backstory, traits) based on: "${prompt}"`
      else if (selectedType === 'image') systemPrompt = `Generate a detailed image generation prompt for: "${prompt}"`

      const response = await fetch('/api/perplexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType === 'image' ? 'image_prompt' : 'text', prompt: systemPrompt })
      })

      const data = await response.json()

      if (!data.success) throw new Error(data.error || 'Failed to generate content')

      if (selectedType === 'image') {
        // If it was an image request, we first got a refined prompt, now generate the actual image
        const imageResponse = await fetch('/api/perplexity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'image_generation',
            prompt: data.content
          })
        })
        const imageData = await imageResponse.json()
        if (imageData.success) {
          setGeneratedImage(imageData.imageUrl)
          setGeneratedContent(data.content)
        } else {
          throw new Error('Failed to generate image')
        }
      } else {
        setGeneratedContent(data.content)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      setError('Failed to copy content')
    }
  }

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = `generated-art-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-story-dark selection:bg-blue-500/30">
      <Navigation />

      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
      </div>

      <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-glow">
                AI Creative Assistant
              </h1>
              <p className="text-story-text-secondary text-lg">
                Supercharge your creativity with AI. Generate lyrics, stories, characters, and art.
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-8 shadow-2xl space-y-8">
              {/* Type Selection */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {GENERATION_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedType(option.id)}
                    className={`p-4 rounded-xl border transition-all duration-300 text-left flex flex-col items-center text-center gap-2 ${selectedType === option.id
                        ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-medium text-sm">{option.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300 ml-1">
                  {selectedType === 'lyrics' ? 'What is the song about?' :
                    selectedType === 'story' ? 'What is the story idea?' :
                      selectedType === 'character' ? 'Describe the character concept' :
                        'Describe the image you want to create'}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                  placeholder="Enter your prompt here..."
                />
              </div>

              <button
                onClick={generateContent}
                disabled={loading}
                className="btn-primary w-full py-4 text-lg font-medium shadow-lg shadow-blue-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  '✨ Generate'
                )}
              </button>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center gap-3"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </motion.div>
              )}

              {/* Results Display */}
              {(generatedContent || generatedImage) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/20 rounded-xl p-6 border border-white/5 space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Generated Result</h3>
                    {generatedContent && !generatedImage && (
                      <button
                        onClick={copyToClipboard}
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center transition-colors"
                      >
                        {copySuccess ? 'Copied!' : 'Copy Text'}
                      </button>
                    )}
                  </div>

                  {generatedImage ? (
                    <div className="space-y-4">
                      <div className="relative aspect-square max-w-md mx-auto rounded-xl overflow-hidden shadow-2xl border border-white/10">
                        <Image
                          src={generatedImage}
                          alt="Generated artwork"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-sm text-story-text-secondary italic text-center">
                        Prompt: {generatedContent}
                      </p>
                      <button
                        onClick={downloadImage}
                        className="btn-secondary w-full py-3"
                      >
                        Download Image
                      </button>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap text-story-text-secondary font-mono text-sm leading-relaxed">
                      {generatedContent}
                    </pre>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}