"use client";

import React from 'react';

import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CallToAction from "@/components/CallToAction";
import ProductShowcase from "@/components/ProductShowcase";
import Testimonials from "@/components/Testimonials";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <Hero />

      <ProductShowcase />
   

      {/* Features Section */}
      <Features />
      
      {/* Product Showcase */}

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* Call to Action */}
      <CallToAction />

      {/* FAQ Section */}
      <FAQ />

    </div>
  );
}
