import './MicroWinBanner.css';

/**
 * Micro Win Banner — Phase 2
 * Design System §7.7
 *
 * Appears below exercise row after logging, slides in subtly.
 * "+2 pushups from last time" | "Best plank in 14 days"
 */
export default function MicroWinBanner({ message, type }) {
  if (!message) return null;

  return (
    <div className={`micro-win-banner micro-win-banner--${type}`} id="micro-win-banner">
      <span className="micro-win-banner__text">{message}</span>
    </div>
  );
}
