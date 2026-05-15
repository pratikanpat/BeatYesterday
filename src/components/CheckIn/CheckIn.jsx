import { useState } from 'react';
import { Moon, Zap, Clock } from 'lucide-react';
import './CheckIn.css';

const SLEEP_OPTIONS = [
  { value: 1, label: 'Bad', emoji: '😴' },
  { value: 2, label: 'Okay', emoji: '😐' },
  { value: 3, label: 'Good', emoji: '😊' },
];

const ENERGY_OPTIONS = [
  { value: 1, label: 'Low', emoji: '🪫' },
  { value: 2, label: 'Medium', emoji: '⚡' },
  { value: 3, label: 'High', emoji: '🔥' },
];

const TIME_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60+ min' },
];

/**
 * Energy/Sleep Check-in — Phase 2
 * 3 taps before session: sleep quality, energy, time available
 */
export default function CheckIn({ onComplete, onSkip }) {
  const [step, setStep] = useState(0); // 0: sleep, 1: energy, 2: time
  const [sleepQuality, setSleepQuality] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(null);
  const [timeAvailable, setTimeAvailable] = useState(null);

  const handleSleepSelect = (value) => {
    setSleepQuality(value);
    setStep(1);
  };

  const handleEnergySelect = (value) => {
    setEnergyLevel(value);
    setStep(2);
  };

  const handleTimeSelect = (value) => {
    setTimeAvailable(value);
    onComplete({
      sleepQuality,
      energyLevel,
      timeAvailable: value,
    });
  };

  return (
    <div className="checkin" id="checkin">
      {/* Progress dots */}
      <div className="checkin__progress">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className={`checkin__dot ${i === step ? 'checkin__dot--active' : ''} ${i < step ? 'checkin__dot--done' : ''}`}
          />
        ))}
      </div>

      {/* Step 0: Sleep */}
      {step === 0 && (
        <div className="checkin__step">
          <div className="checkin__icon-wrap">
            <Moon size={28} />
          </div>
          <h2 className="checkin__question">HOW DID YOU SLEEP?</h2>
          <div className="checkin__options">
            {SLEEP_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className="checkin__option-btn"
                onClick={() => handleSleepSelect(opt.value)}
              >
                <span className="checkin__emoji">{opt.emoji}</span>
                <span className="checkin__option-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Energy */}
      {step === 1 && (
        <div className="checkin__step">
          <div className="checkin__icon-wrap">
            <Zap size={28} />
          </div>
          <h2 className="checkin__question">ENERGY LEVEL?</h2>
          <div className="checkin__options">
            {ENERGY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className="checkin__option-btn"
                onClick={() => handleEnergySelect(opt.value)}
              >
                <span className="checkin__emoji">{opt.emoji}</span>
                <span className="checkin__option-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Time */}
      {step === 2 && (
        <div className="checkin__step">
          <div className="checkin__icon-wrap">
            <Clock size={28} />
          </div>
          <h2 className="checkin__question">TIME AVAILABLE?</h2>
          <div className="checkin__options checkin__options--time">
            {TIME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className="checkin__option-btn checkin__option-btn--time"
                onClick={() => handleTimeSelect(opt.value)}
              >
                <span className="checkin__option-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Skip option */}
      <button className="checkin__skip" onClick={onSkip}>
        Skip check-in
      </button>
    </div>
  );
}
