import { useRef, useCallback } from 'react';
import { Share2, Download, X } from 'lucide-react';
import './PRShareCard.css';

/**
 * PR Share Card — Phase 2
 * Auto-generated canvas card for sharing PRs on Instagram/WhatsApp.
 */
export default function PRShareCard({ isOpen, onClose, exerciseName, value, inputType, previousBest }) {
  const canvasRef = useRef(null);

  const formatValue = (val) => {
    if (inputType === 'time') {
      const mins = Math.floor(val / 60);
      const secs = val % 60;
      if (mins > 0) return `${mins}:${String(secs).padStart(2, '0')}`;
      return `${val}s`;
    }
    return String(val);
  };

  const unit = inputType === 'time' ? 'SEC' : 'REPS';
  const delta = previousBest ? value - previousBest : null;

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Card dimensions (Instagram story aspect ratio)
    const w = 1080;
    const h = 1920;
    canvas.width = w;
    canvas.height = h;

    // Background
    ctx.fillStyle = '#070707';
    ctx.fillRect(0, 0, w, h);

    // Subtle radial glow
    const gradient = ctx.createRadialGradient(w / 2, h / 2 - 100, 0, w / 2, h / 2 - 100, 400);
    gradient.addColorStop(0, 'rgba(230, 57, 70, 0.08)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // "BEAT YESTERDAY" label
    ctx.fillStyle = '#E63946';
    ctx.font = '700 64px "Bebas Neue", "Anton", sans-serif';
    ctx.letterSpacing = '8px';
    ctx.textAlign = 'center';
    ctx.fillText('BEAT YESTERDAY', w / 2, h / 2 - 300);

    // Exercise name
    ctx.fillStyle = '#999999';
    ctx.font = '500 36px "Satoshi", "Inter", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(exerciseName.toUpperCase(), w / 2, h / 2 - 200);

    // Big number
    ctx.fillStyle = '#F5F5F5';
    ctx.font = '400 220px "Bebas Neue", "Anton", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText(formatValue(value), w / 2, h / 2 + 50);

    // Unit
    ctx.fillStyle = '#555555';
    ctx.font = '500 28px "Satoshi", "Inter", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText(unit, w / 2, h / 2 + 110);

    // Delta
    if (delta && delta > 0) {
      ctx.fillStyle = '#4CAF50';
      ctx.font = '400 32px "Satoshi", "Inter", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(`+${delta} from previous best`, w / 2, h / 2 + 180);
    }

    // Tagline
    ctx.fillStyle = '#555555';
    ctx.font = 'italic 24px "Satoshi", "Inter", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('"Half an hour still counts."', w / 2, h - 200);

    // Brand
    ctx.fillStyle = '#333333';
    ctx.font = '400 20px "Satoshi", "Inter", sans-serif';
    ctx.fillText('BeatYesterday', w / 2, h - 140);
  }, [exerciseName, value, inputType, unit, delta]);

  // Draw when opened
  if (isOpen && canvasRef.current) {
    setTimeout(drawCard, 50);
  }

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share) {
          const file = new File([blob], `pr-${exerciseName.toLowerCase().replace(/\s+/g, '-')}.png`, { type: 'image/png' });
          await navigator.share({
            title: `New PR: ${exerciseName}`,
            text: `${formatValue(value)} ${unit.toLowerCase()} — Beat Yesterday 🔥`,
            files: [file],
          });
        } else {
          // Fallback: download
          handleDownload();
        }
      }, 'image/png');
    } catch (err) {
      console.log('Share cancelled or failed:', err);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `pr-${exerciseName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="pr-share-overlay" onClick={onClose}>
      <div className="pr-share-card" onClick={(e) => e.stopPropagation()}>
        <div className="pr-share-card__header">
          <h2 className="pr-share-card__title">SHARE PR</h2>
          <button className="pr-share-card__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Canvas preview */}
        <div className="pr-share-card__preview">
          <canvas
            ref={(el) => {
              canvasRef.current = el;
              if (el) setTimeout(drawCard, 50);
            }}
            className="pr-share-card__canvas"
          />
        </div>

        {/* Actions */}
        <div className="pr-share-card__actions">
          <button className="pr-share-card__action-btn pr-share-card__action-btn--share" onClick={handleShare}>
            <Share2 size={18} />
            SHARE
          </button>
          <button className="pr-share-card__action-btn pr-share-card__action-btn--download" onClick={handleDownload}>
            <Download size={18} />
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}
