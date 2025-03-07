'use client'

import Link from 'next/link'
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-pastel-pink/20 border-t-4 border-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold heading-gradient">MagnetCraft</h3>
            <p className="text-gray-600 text-sm">
              Creating beautiful custom magnets for your home and office. Transform your space with personalized memories.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-pastel-pink hover:text-gold transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-pastel-pink hover:text-gold transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-pastel-pink hover:text-gold transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-pastel-pink hover:text-gold transition-colors">
                <FaPinterest size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-gold text-sm">Products</Link>
              </li>
              <li>
                <Link href="/custom" className="text-gray-600 hover:text-gold text-sm">Custom Design</Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gold text-sm">About Us</Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-gold text-sm">Blog</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gold text-sm">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gold text-sm">Contact Us</Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-gold text-sm">Shipping Info</Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-gold text-sm">Returns Policy</Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-gold text-sm">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stay Updated</h3>
            <p className="text-gray-600 text-sm mb-4">Subscribe to our newsletter for updates and exclusive offers.</p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-styled w-full"
              />
              <button
                type="submit"
                className="btn-gold w-full"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gold/30 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} MagnetCraft. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gold">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gold">Terms of Service</Link>
              <Link href="/sitemap" className="text-sm text-gray-600 hover:text-gold">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 