'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaLeaf, FaHeart, FaAward, FaTruck } from 'react-icons/fa'

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM30 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S20 25.523 20 20s4.477-10 10-10z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-pink-700 uppercase bg-pink-100 rounded-full">
              Our Journey
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              The Story Behind My Sweet Magnets
            </h1>
            <p className="text-xl text-pink-100 max-w-3xl mx-auto">
              Handcrafted in the UK with love, creativity, and a dash of magic
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-100 rounded-full opacity-50"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                {/* Replace with actual image */}
                <div className="aspect-[4/3] bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <Image src="/images/magnet3.jpeg" alt="Workshop Photo" fill className="object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              A Sweet Beginning in Manchester
            </h2>
            <div className="prose prose-pink max-w-none">
              <p>
                My Sweet Magnets was born in 2018 from a simple idea between two sisters, Emma and Sophie, in their Manchester flat. What began as a creative way to decorate their fridge with personal photos quickly turned into a passion for creating beautiful, high-quality photo magnets.
              </p>
              <p>
                "We wanted to find a way to keep our favourite memories close, not just stored away on our phones," says Emma. "There's something special about seeing those moments every day that brings a smile to your face."
              </p>
              <p>
                Starting with just a small printer and a laminator, the sisters perfected their craft, focusing on creating magnets that were not only beautiful but also durable enough to last. Their attention to detail and commitment to quality quickly earned them a loyal following in their local community.
              </p>
              <p>
                Today, My Sweet Magnets has grown into a thriving UK-based business, but we've stayed true to our roots. Every magnet is still designed with the same love and care as those first few we made for our own fridge.
              </p>
              <p className="font-medium text-pink-600">
                "Our mission is simple: to help you turn your precious memories into beautiful, everyday treasures that bring joy to your home."
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Our Values Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              What makes My Sweet Magnets special
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaHeart className="h-8 w-8 text-pink-500 mb-4" />,
                title: 'Made with Love',
                description: 'Every magnet is crafted with care and attention to detail, just like we would for our own family.'
              },
              {
                icon: <FaLeaf className="h-8 w-8 text-green-500 mb-4" />,
                title: 'Eco-Friendly',
                description: 'We use sustainable materials and eco-friendly packaging to minimize our environmental impact.'
              },
              {
                icon: <FaAward className="h-8 w-8 text-yellow-500 mb-4" />,
                title: 'Premium Quality',
                description: 'Only the best materials make it into our products, ensuring your memories last a lifetime.'
              },
              {
                icon: <FaTruck className="h-8 w-8 text-blue-500 mb-4" />,
                title: 'UK Made & Shipped',
                description: 'Designed, printed, and shipped from our Manchester workshop to your door.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Section */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Crafting Smiles Across the UK
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our commitment to quality, sustainability, and bringing joy to everyday life
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="prose prose-indigo max-w-none">
                <p>
                  Word of mouth spread quickly. What began as orders from friends and family soon expanded to local craft fairs, where Maria and Sofia's magnets became an instant hit. People were drawn to the quality and the personal touch that went into each creation.
                </p>
                <p>
                  "We remember our first craft fair," Sofia recalls with a smile. "We sold out within hours and took orders for weeks afterward. That's when we knew we had something special."
                </p>
                <p>
                  As demand grew, so did their operation. They moved from their kitchen table to a small workshop, invested in professional equipment, and refined their techniques. Sofia developed an online store, bringing their creations to customers nationwide.
                </p>
                <p>
                  The business faced challenges, especially during the pandemic, but their commitment to quality and personal connection with customers helped them not just survive but thrive. They expanded their product line, hired their first employees, and continued to put heart into every magnet they created.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-pink-100 rounded-full opacity-50"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-yellow-100 rounded-full opacity-50"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  {/* Replace with actual image */}
                  <div className="aspect-[4/3] bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <Image src="/images/magnet5.jpeg" alt="Workshop Photo" fill className="object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Values
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            The principles that guide everything we do
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Value 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-xl shadow-md border border-gray-100"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Family First</h3>
            <p className="text-gray-600">
              We started as a family and we run our business with family values. We treat our customers and team members like family, with care and respect.
            </p>
          </motion.div>

          {/* Value 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-xl shadow-md border border-gray-100"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Promise</h3>
            <p className="text-gray-600">
              We never compromise on quality. Every magnet is crafted with premium materials and attention to detail, ensuring your memories are preserved beautifully.
            </p>
          </motion.div>

          {/* Value 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-xl shadow-md border border-gray-100"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-pink-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Touch</h3>
            <p className="text-gray-600">
              We believe in the power of personalization. Each order receives individual attention to ensure your magnets are as unique as the memories they display.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Our Process */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Process
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              How we transform your photos into beautiful, lasting magnets
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload</h3>
              <p className="text-gray-600">
                You upload your favorite photos through our easy-to-use platform.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enhance</h3>
              <p className="text-gray-600">
                Our team optimizes your images for the best print quality.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-600">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Print</h3>
              <p className="text-gray-600">
                We print your photos on premium materials with vibrant, long-lasting colors.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Deliver</h3>
              <p className="text-gray-600">
                Your custom magnets are carefully packaged and delivered to your door.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Meet the Team */}
      <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            The passionate people behind MagnetCraft
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Team Member 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="relative rounded-xl overflow-hidden mb-4 mx-auto w-40 h-40 bg-gray-200">
              {/* Replace with actual image */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Maria
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Maria</h3>
            <p className="text-indigo-600 mb-2">Founder & Creative Director</p>
            <p className="text-gray-600 text-sm">
              The heart and soul of MagnetCraft, Maria brings artistic vision and warmth to everything we do.
            </p>
          </motion.div>

          {/* Team Member 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="relative rounded-xl overflow-hidden mb-4 mx-auto w-40 h-40 bg-gray-200">
              {/* Replace with actual image */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Sofia
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Sofia</h3>
            <p className="text-indigo-600 mb-2">Co-Founder & Business Director</p>
            <p className="text-gray-600 text-sm">
              Sofia combines business acumen with creative insight to grow our company while maintaining our values.
            </p>
          </motion.div>

          {/* Team Member 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="relative rounded-xl overflow-hidden mb-4 mx-auto w-40 h-40 bg-gray-200">
              {/* Replace with actual image */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Alex
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Alex</h3>
            <p className="text-indigo-600 mb-2">Production Manager</p>
            <p className="text-gray-600 text-sm">
              Alex ensures every magnet meets our high-quality standards before it leaves our workshop.
            </p>
          </motion.div>

          {/* Team Member 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="relative rounded-xl overflow-hidden mb-4 mx-auto w-40 h-40 bg-gray-200">
              {/* Replace with actual image */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Emma
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Emma</h3>
            <p className="text-indigo-600 mb-2">Customer Happiness</p>
            <p className="text-gray-600 text-sm">
              Emma makes sure every customer has an amazing experience from order to delivery.
            </p>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Create Your Own Memories?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Join thousands of happy customers who have transformed their photos into beautiful magnets.
            </p>
            <Link
              href="/custom"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 transition-colors"
            >
              Start Creating Now
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 