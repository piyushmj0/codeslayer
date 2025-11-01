"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Brain,
  Route,
  ArrowRight,
  LayoutGrid,
  ClipboardList,
  Users,
  Repeat,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ValueCard from "@/components/ValueCard";
import Flow from "@/components/Flow";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
const heroImages = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80",
  "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1600&q=80",
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100  ">
      <main>
        <Navbar />
        <section className="relative overflow-hidden bg-white pt-20 md:pt-0 px-6 md:px-20">
          {heroImages.map((src, index) => (
            <div
              key={src}
              className={`hero-bg-image ${
                index === currentSlide ? "active" : ""
              }`}
              style={{ backgroundImage: `url('${src}')` }}
            />
          ))}

          <div className="container relative z-20 mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-80px)] md:min-h-0 md:py-32 lg:py-40">
            <div className="text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6"
              >
                <span className="inline-block px-4 py-2 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full text-amber-300 text-sm font-medium tracking-wide">
                  Tourist Travel Safety Platform
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-6xl md:text-8xl font-bold text-white mb-8 leading-[1.1] tracking-tight"
              >
                Explore Fearlessly.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  Travel Securely.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed max-w-2xl"
              >
                Your personal AI safety companion for exploring India. Get
                real-time alerts, one-tap emergency help, and travel with
                ultimate peace of mind.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-amber-500/50 transition-all duration-300"
                >
                  <Link href="/register">
                    Create Your Safe Profile
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="border-2 border-white text-white hover:backdrop-blur-md hover:text-black  px-8 py-6 text-lg rounded-xl transition-all duration-300"
                >
                  <a href="#features">Learn More</a>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                Trusted Nationwide
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Building India&apos;s largest safety network, one journey at a
                time
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <StatCard
                icon={LayoutGrid}
                label="Departments"
                centralValue={4}
                stateValue={1}
                delay={0.1}
              />
              <StatCard
                icon={ClipboardList}
                label="Services"
                centralValue={4}
                stateValue={1}
                delay={0.2}
              />
              <StatCard
                icon={Users}
                label="Registrations"
                value={900}
                suffix="+"
                delay={0.3}
              />
              <StatCard
                icon={Repeat}
                label="Active Hours"
                value={4}
                suffix="+ hours"
                delay={0.4}
              />
            </div>
          </div>
        </section>

        <section id="features" className="py-32 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                Why Trust Paryatak Suraksha?
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Advanced technology meets compassionate care, ensuring your
                safety every step of the way
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              <ValueCard
                icon={Shield}
                title="Blockchain-Verified Identity"
                description="Your identity is secured on the blockchain, ensuring complete data protection and privacy."
                delay={0.1}
              />
              <ValueCard
                icon={Brain}
                title="Real-time Anomaly Detection"
                description="monitor your journey 24/7, alerting you to potential safety concerns."
                delay={0.2}
              />
              <ValueCard
                icon={Route}
                title="Geo-fenced Powered Safe Routes"
                description="Navigate confidently with intelligent route suggestions that prioritize your safety at every turn."
                delay={0.3}
              />
            </div>
          </div>
        </section>
        <div id="flow">
          <Flow />
        </div>

        <section
          id="services"
          className="py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        >
          <div className="container mx-auto px-25">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-bold text-center text-white mb-6">
                Our Services
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Comprehensive safety solutions designed for modern travelers
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <ValueCard
                icon={LayoutGrid}
                title="Interactive Tourist Safety Map"
                description="Access real-time safety heatmaps and alerts for tourist destinations across India."
                delay={0.1}
                dark
              />
              <ValueCard
                icon={ClipboardList}
                title="Smart Itinerary Planning"
                description="Plan your trips with AI-suggested safe routes, accommodations, and local emergency contacts."
                delay={0.2}
                dark
              />
              <ValueCard
                icon={Users}
                title="Group Safety Coordination"
                description="Create and manage travel groups with live location sharing and synchronized alerts."
                delay={0.3}
                dark
              />
              <ValueCard
                icon={CheckCircle}
                title="Verified Travel Partners"
                description="Access to blockchain-verified tour operators, drivers, and accommodations across India."
                delay={0.4}
                dark
              />
              <ValueCard
                icon={Users}
                title="Community Safety Network"
                description="Join a community of verified travelers sharing real-time safety updates and recommendations."
                delay={0.5}
                dark
              />
              <ValueCard
                icon={Shield}
                title="24/7 Support Helpline"
                description="Round-the-clock assistance from our dedicated safety team, available in multiple languages."
                delay={0.6}
                dark
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-br from-amber-500 to-orange-600">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Ready to Travel with Confidence?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who trust Paryatak Suraksha for a
              safer, more secure journey across India.
            </p>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="bg-white text-black px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-amber-500/50 hover:bg-slate-300 transition-all duration-300"
            >
              <Link href="/register">
                Start Your Safe Journey Today
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
