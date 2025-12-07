'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWalletConnection } from '../lib/useWalletConnection'

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/explore', label: 'Explore', icon: '🌐' },
  { href: '/upload', label: 'Create', icon: '✨' },
  { href: '/ai', label: 'AI Studio', icon: '🤖' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
]

export default function Navigation() {
  const { address, isConnected, isMobile, connectWallet, disconnectWallet } = useWalletConnection()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch notifications count
  useEffect(() => {
    if (isConnected && address) {
      fetchNotifications()
    }
  }, [isConnected, address])

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?owner=${address}`)
      const data = await res.json()
      if (data.success) {
        setNotifications(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-blur shadow-lg shadow-black/20' : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg shadow-purple-500/25"
              >
                🎵
              </motion.div>
              <span className="text-xl font-bold text-white group-hover:text-gradient transition-all">
                Melodex
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all ${pathname === link.href
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/10"
                      style={{ zIndex: -1 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side - Wallet & Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              {isConnected && (
                <Link
                  href="/notifications"
                  className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs font-bold text-white flex items-center justify-center animate-pulse">
                      {notifications > 9 ? '9+' : notifications}
                    </span>
                  )}
                </Link>
              )}

              {/* Admin Link (show if isAdmin - you can add proper check) */}
              {isConnected && (
                <Link
                  href="/admin"
                  className="hidden sm:flex p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              )}

              {/* Wallet Button */}
              {!isConnected ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={connectWallet}
                  className="btn-primary py-2.5 px-5 text-sm"
                >
                  <span>{isMobile ? '📱' : '🦊'}</span>
                  Connect
                </motion.button>
              ) : (
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                    <span className="text-sm font-medium text-white">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.button>

                  {/* Dropdown */}
                  <div className="absolute top-full right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                    <div className="glass-panel rounded-xl p-2 shadow-2xl shadow-black/50">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <span>📊</span>
                        Dashboard
                      </Link>
                      <Link
                        href="/upload"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <span>✨</span>
                        Create IP
                      </Link>
                      <div className="h-px bg-white/10 my-2" />
                      <button
                        onClick={disconnectWallet}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <span>🚪</span>
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-[#0a0f1e] border-l border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${pathname === link.href
                        ? 'text-white bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <span className="text-xl">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}

                {isConnected && (
                  <>
                    <div className="h-px bg-white/10 my-4" />
                    <Link
                      href="/notifications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <span className="text-xl">🔔</span>
                      Notifications
                      {notifications > 0 && (
                        <span className="ml-auto px-2 py-0.5 bg-red-500 rounded-full text-xs text-white">
                          {notifications}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <span className="text-xl">⚙️</span>
                      Admin
                    </Link>
                  </>
                )}
              </nav>

              {isConnected && (
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="glass-panel rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-500">Connected</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-center font-medium"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}