import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2 } from 'lucide-react';
import useWorkoutStore from '../../store/useWorkoutStore.js';
import PRShareCard from '../PRShareCard/PRShareCard.jsx';
import './PRCelebration.css';

/**
 * PR Celebration Overlay — THE ONE EMOTIONAL MOMENT
 * Design System §7.6
 *
 * Full-screen overlay with cinematic animation sequence.
 * Auto-dismisses after 3.5s or on tap.
 */
export default function PRCelebration() {
  const celebrationData = useWorkoutStore(s => s.celebrationData);
  const clearCelebration = useWorkoutStore(s => s.clearCelebration);
  const [showShare, setShowShare] = useState(false);

  const dismiss = useCallback(() => {
    clearCelebration();
  }, [clearCelebration]);

  // Auto-dismiss after 3.5s (paused when share card is open)
  useEffect(() => {
    if (!celebrationData || showShare) return;
    const timer = setTimeout(dismiss, 3500);
    return () => clearTimeout(timer);
  }, [celebrationData, dismiss, showShare]);

  // Reset share state when celebration changes
  useEffect(() => {
    if (!celebrationData) setShowShare(false);
  }, [celebrationData]);

  const formatValue = (value, inputType) => {
    if (inputType === 'time') {
      const mins = Math.floor(value / 60);
      const secs = value % 60;
      if (mins > 0) return `${mins}:${String(secs).padStart(2, '0')}`;
      return `${secs}`;
    }
    return String(value);
  };

  return (
    <AnimatePresence>
      {celebrationData && (
        <motion.div
          className="pr-celebration"
          onClick={dismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* White flash */}
          <motion.div
            className="pr-celebration__flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.06, 0] }}
            transition={{ duration: 0.25 }}
          />

          {/* Accent glow */}
          <motion.div
            className="pr-celebration__glow"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.1, 1], opacity: 0.08 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          />

          {/* Content */}
          <div className="pr-celebration__content">
            {/* BEAT YESTERDAY label */}
            <motion.h2
              className="pr-celebration__label"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.2 }}
            >
              BEAT YESTERDAY
            </motion.h2>

            {/* Exercise name */}
            <motion.p
              className="pr-celebration__exercise"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.2 }}
            >
              {celebrationData.exerciseName}
            </motion.p>

            {/* Hero number */}
            <motion.div
              className="pr-celebration__number"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1], // ease-spring
              }}
            >
              {formatValue(celebrationData.newValue, celebrationData.inputType)}
            </motion.div>

            {/* Unit */}
            <motion.span
              className="pr-celebration__unit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.2 }}
            >
              {celebrationData.inputType === 'time' ? 'SECONDS' : 'REPS'}
            </motion.span>

            {/* Delta */}
            {celebrationData.previousBest && (
              <motion.p
                className="pr-celebration__delta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.2 }}
              >
                +{celebrationData.newValue - celebrationData.previousBest} from previous best
              </motion.p>
            )}

            {/* Actions */}
            <div className="pr-celebration__actions">
              <motion.button
                className="pr-celebration__share-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShare(true);
                }}
              >
                <Share2 size={16} />
                SHARE
              </motion.button>
              <motion.button
                className="pr-celebration__dismiss"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.2 }}
                onClick={dismiss}
              >
                KEEP GOING →
              </motion.button>
            </div>

            {/* PR Share Card */}
            {showShare && celebrationData && (
              <PRShareCard
                isOpen={true}
                onClose={() => setShowShare(false)}
                exerciseName={celebrationData.exerciseName}
                value={celebrationData.newValue}
                inputType={celebrationData.inputType}
                previousBest={celebrationData.previousBest}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
