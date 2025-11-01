"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ValueCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  dark?: boolean;
}

const ValueCard = ({ icon: Icon, title, description, delay = 0, dark = false }: ValueCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`group relative p-8 rounded-2xl transition-all duration-300 ${
        dark 
          ? 'bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20' 
          : 'bg-white border border-slate-200 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-500/10'
      }`}
    >
      {/* Icon */}
      <div className={`mb-6 inline-flex p-4 rounded-xl transition-all duration-300 ${
        dark
          ? 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20'
          : 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 group-hover:from-amber-500 group-hover:to-orange-600 group-hover:text-white'
      }`}>
        <Icon className="w-7 h-7" />
      </div>

      {/* Content */}
      <h3 className={`text-2xl font-bold mb-4 ${
        dark ? 'text-white' : 'text-slate-900'
      }`}>
        {title}
      </h3>
      <p className={`leading-relaxed ${
        dark ? 'text-gray-300' : 'text-slate-600'
      }`}>
        {description}
      </p>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        dark 
          ? 'bg-gradient-to-br from-amber-500/5 to-orange-500/5' 
          : 'bg-gradient-to-br from-amber-500/5 to-orange-500/5'
      }`} />
    </motion.div>
  );
};

export default ValueCard;