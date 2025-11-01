"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Shield, MapPin, Bell, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Profile',
    description: 'Sign up and set up your secure traveler profile with emergency contacts'
  },
  {
    icon: Shield,
    title: 'Verify Identity',
    description: 'Complete blockchain-based identity verification for enhanced security'
  },
  {
    icon: MapPin,
    title: 'Plan Journey',
    description: 'Get Geo-fenced Data driven safe route recommendations tailored to your destination'
  },
  {
    icon: Bell,
    title: 'Stay Protected',
    description: 'Receive real-time safety alerts and updates throughout your journey'
  },
  {
    icon: CheckCircle,
    title: 'Travel Safely',
    description: 'Explore with confidence knowing help is just one tap away'
  }
];

export default function Flow() {
  return (
    <section id="flow" className="py-32 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Get started in minutes and experience peace of mind on every journey
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative mb-16 last:mb-0"
            >
              <div className={`flex flex-col md:flex-row items-center gap-8 ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}>
                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xl mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-lg text-slate-600 max-w-md">
                    {step.description}
                  </p>
                </div>

                {/* Icon Circle */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <step.icon className="w-16 h-16 text-amber-600" />
                  </div>
                  
                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute left-1/2 top-full w-0.5 h-16 bg-gradient-to-b from-amber-300 to-transparent transform -translate-x-1/2" />
                  )}
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden md:block" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}