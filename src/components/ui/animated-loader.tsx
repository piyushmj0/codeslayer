import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedLoaderProps {
  message: string;
}

const AnimatedLoader = ({ message }: AnimatedLoaderProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated circles */}
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-4 h-4 rounded-full bg-amber-500"
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>

          

          {/* Message */}
          <div className="text-center">
            <motion.p
              className="text-lg font-semibold text-orange-600"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {message}
            </motion.p>
            <p className="text-sm text-gray-500 mt-2">Please wait...</p>
          </div>

          {/* Progress Bar */}
          <motion.div
            className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
              animate={{
                width: ["0%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedLoader;