import { useRef, useCallback, useState } from 'react';
import { Share2, Download, X } from 'lucide-react';
import './PRShareCard.css';

/**
 * PR Share Card — Phase 2 + Phase 3.5 Theme Upgrade
 *
 * Auto-generated canvas card for sharing PRs.
 * Now with 3 themes: Original, Midnight, Fire.
 */

const THEMES = [
  {
    id: 'original',
    name: 'Original',
    bg: '#070707',
    glowColor: 'rgba(230, 57, 70, 0.08)',
    labelColor: '#E63946',
    nameColor: '#999999',
    numberColor: '#F5F5F5',
    unitColor: '#555555',
    deltaColor: '#4CAF50',
    taglineColor: '#555555',
    brandColor: '#333333',
    previewColor: '#E63946',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    bg: '#0a0e1a',
    glowColor: 'rgba(99, 102, 241, 0.10)',
    labelColor: '#6366f1',
    nameColor: '#94a3b8',
    numberColor: '#e2e8f0',
    unitColor: '#475569',
    deltaColor: '#34d399',
    taglineColor: '#475569',
    brandColor: '#334155',
    previewColor: '#6366f1',
  },
  {
    id: 'fire',
    name: 'Fire',
    bg: '#1a0a0a',
    glowColor: 'rgba(251, 146, 60, 0.10)',
    labelColor: '#fb923c',
    nameColor: '#a8a29e',
    numberColor: '#fef3c7',
    unitColor: '#57534e',
    deltaColor: '#fbbf24',
    taglineColor: '#57534e',
    brandColor: '#44403c',
    previewColor: '#fb923c',
  },
];

export default function PRShareCard({ isOpen, onClose, exerciseName, value, inputType, previousBest }) {
  const canvasRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState('original');

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

  const drawCard = useCallback((themeId) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

    // Card dimensions (Instagram story aspect ratio)
    const w = 1080;
    const h = 1920;
    canvas.width = w;
    canvas.height = h;

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle radial glow
    const gradient = ctx.createRadialGradient(w / 2, h / 2 - 100, 0, w / 2, h / 2 - 100, 400);
    gradient.addColorStop(0, theme.glowColor);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // "BEAT YESTERDAY" label
    ctx.fillStyle = theme.labelColor;
    ctx.font = '700 64px "Bebas Neue", "Anton", sans-serif';
    ctx.letterSpacing = '8px';
    ctx.textAlign = 'center';
    ctx.fillText('BEAT YESTERDAY', w / 2, h / 2 - 300);

    // Exercise name
    ctx.fillStyle = theme.nameColor;
    ctx.font = '500 36px "Satoshi", "Inter", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(exerciseName.toUpperCase(), w / 2, h / 2 - 200);

    // Big number
    ctx.fillStyle = theme.numberColor;
    ctx.font = '400 220px "Bebas Neue", "Anton", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText(formatValue(value), w / 2, h / 2 + 50);

    // Unit
    ctx.fillStyle = theme.unitColor;
    ctx.font = '500 28px "Satoshi", "Inter", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText(unit, w / 2, h / 2 + 110);

    // Delta
    if (delta && delta > 0) {
      ctx.fillStyle = theme.deltaColor;
      ctx.font = '400 32px "Satoshi", "Inter", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(`+${delta} from previous best`, w / 2, h / 2 + 180);
    }

    // Tagline
    ctx.fillStyle = theme.taglineColor;
    ctx.font = 'italic 24px "Satoshi", "Inter", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('"Half an hour still counts."', w / 2, h - 200);

    // Brand
    ctx.fillStyle = theme.brandColor;
    ctx.font = '400 20px "Satoshi", "Inter", sans-serif';
    ctx.fillText('BeatYesterday', w / 2, h - 140);
  }, [exerciseName, value, inputType, unit, delta]);

  // Draw when theme changes or opened
  const handleThemeChange = (themeId) => {
    setActiveTheme(themeId);
    setTimeout(() => drawCard(themeId), 50);
  };

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

        {/* Theme selector */}
        <div className="pr-share-card__themes">
          {THEMES.map(theme => (
            <button
              key={theme.id}
              className={`pr-share-card__theme-dot ${activeTheme === theme.id ? 'pr-share-card__theme-dot--active' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
              aria-label={`${theme.name} theme`}
              style={{ '--dot-color': theme.previewColor }}
            />
          ))}
        </div>

        {/* Canvas preview */}
        <div className="pr-share-card__preview">
          <canvas
            ref={(el) => {
              canvasRef.current = el;
              if (el) setTimeout(() => drawCard(activeTheme), 50);
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
