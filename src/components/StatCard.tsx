"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

function useCountUp(targetValue: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentValue = progress * targetValue;
      
      setCount(Math.ceil(currentValue));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [targetValue, duration, isVisible]);

  return { count, ref: elementRef };
}

const AnimatedNumber = ({ targetValue }: { targetValue: number }) => {
  const { count, ref } = useCountUp(targetValue);
  return <span ref={ref}>{count}</span>;
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  centralValue?: number;
  stateValue?: number;
  value?: number;
  suffix?: string;
  delay?: number;
}

const StatCard = ({ 
  icon: Icon, 
  label, 
  centralValue, 
  stateValue, 
  value, 
  suffix = '', 
  delay = 0 
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="group relative bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-300 transition-all duration-300"
    >
      {/* Icon */}
      <div className="mb-6 inline-flex p-4 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 group-hover:from-amber-500 group-hover:to-orange-600 group-hover:text-white transition-all duration-300">
        <Icon className="w-7 h-7" />
      </div>

      {/* Label */}
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        {label}
      </p>

      {/* Values */}
      {centralValue !== undefined && stateValue !== undefined ? (
        <div className="flex items-baseline space-x-4">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Central</span>
            <span className="text-3xl font-bold text-slate-900">
              <AnimatedNumber targetValue={centralValue} />
            </span>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <div>
            <span className="text-xs text-slate-400 block mb-1">State</span>
            <span className="text-3xl font-bold text-slate-900">
              <AnimatedNumber targetValue={stateValue} />
            </span>
          </div>
        </div>
      ) : (
        <div className="text-4xl font-bold text-slate-900">
          <AnimatedNumber targetValue={value || 0} />
          <span className="text-2xl ml-1 font-semibold text-amber-600">{suffix}</span>
        </div>
      )}

      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

export default StatCard;