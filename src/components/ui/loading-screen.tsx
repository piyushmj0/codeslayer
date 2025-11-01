import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Loading Your Dashboard" }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#B8732E] to-[#FFC078]">
      <div className="bg-white p-8 rounded-xl shadow-2xl">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo animation */}
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-[#170606] via-[#4a0e0e] to-[#3D1212] rounded-lg"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Loading dots */}
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 rounded-full bg-[#D49748]"
                animate={{
                  y: ["0%", "-50%", "0%"],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>

          {/* Message */}
          <motion.div
            className="text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <p className="text-xl font-semibold text-[#4a0e0e]">{message}</p>
            <p className="text-sm text-[#D49748] mt-2">Please wait while we prepare your experience</p>
          </motion.div>

          {/* Progress bar */}
          <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#170606] via-[#4a0e0e] to-[#3D1212]"
              animate={{
                x: ["-100%", "0%"],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;