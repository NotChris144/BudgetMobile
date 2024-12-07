import React, { useEffect } from 'react';
import { motion, usePresence, AnimatePresence } from 'framer-motion';

interface WelcomeMessageProps {
  username: string;
}

const Letter: React.FC<{ letter: string; delay: number }> = ({ letter, delay }) => {
  const [isPresent, safeToRemove] = usePresence();

  const animations = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { delay, duration: 0.15 } 
    },
    exit: { opacity: 0, y: 10 }
  };

  useEffect(() => {
    !isPresent && setTimeout(safeToRemove, 1000);
  }, [isPresent, safeToRemove]);

  return (
    <motion.span
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animations}
      className={letter === ' ' ? 'inline-block w-1' : 'inline-block'}
    >
      {letter}
    </motion.span>
  );
};

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ username }) => {
  const greeting = "Hi,";
  const baseDelay = 0.2;
  const letterDelay = 0.05;
  const pauseBeforeName = 0.3;

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-medium text-gray-300 flex items-baseline">
        <span className="inline-flex">
          <AnimatePresence mode="wait">
            {greeting.split('').map((letter, index) => (
              <Letter
                key={`greeting-${index}`}
                letter={letter}
                delay={baseDelay + index * letterDelay}
              />
            ))}
          </AnimatePresence>
        </span>
        <span className="inline-flex text-purple-400">
          <AnimatePresence mode="wait">
            {username.split('').map((letter, index) => (
              <Letter
                key={`name-${index}`}
                letter={letter}
                delay={baseDelay + greeting.length * letterDelay + pauseBeforeName + index * letterDelay}
              />
            ))}
          </AnimatePresence>
        </span>
      </h2>
    </div>
  );
};

export default WelcomeMessage;