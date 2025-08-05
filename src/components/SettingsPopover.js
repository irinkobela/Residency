import React, { useState, useRef, useEffect } from 'react';
import useTheme from '../hooks/useTheme';
import { useShortcuts } from '../contexts/ShortcutContext';
import './Settings.css';

export default function SettingsPopover() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null); // ✅ Needed for outside click

  const { isDarkMode, setIsDarkMode, fontSize, setFontSize } = useTheme();
  const {
    shortcutPrev, setShortcutPrev,
    shortcutNext, setShortcutNext,
    shortcutExplanation, setShortcutExplanation
  } = useShortcuts();

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 1, 22));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 1, 12));
  const handleShortcutChange = (e, setter) => {
    setter(e.target.value.toLowerCase() === 'space' ? ' ' : e.target.value);
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="settings-popover">
      <button
        className="settings-button"
        onClick={() => setOpen(o => !o)}
        aria-label="Open Settings"
      >
        ⚙️
      </button>

      {open && (
        <div className="settings-dropdown" ref={dropdownRef}>
          <button
            className="settings-close-button"
            onClick={() => setOpen(false)}
            aria-label="Close Settings"
          >
            ✖️
          </button>
          <h2>⚙️ პარამეტრები</h2>

          <div className="setting-item">
            <span>🌙 ბნელი რეჟიმი</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleDarkMode}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="setting-item">
            <span>🔠 შრიფტის ზომა: {fontSize}px</span>
            <div className="font-size-controls">
              <button onClick={decreaseFontSize} disabled={fontSize <= 12}>
                A-
              </button>
              <button onClick={increaseFontSize} disabled={fontSize >= 22}>
                A+
              </button>
            </div>
          </div>

          <div className="setting-item">
            <span>⌨️ კლავიატურის მარშრუტები</span>

            <div className="shortcut-setting">
              <label>
                ◀️ წინა კითხვა:
                <input
                  type="text"
                  maxLength={20}
                  value={shortcutPrev}
                  onChange={(e) => handleShortcutChange(e, setShortcutPrev)}
                />
              </label>
            </div>

            <div className="shortcut-setting">
              <label>
                ▶️ შემდეგი კითხვა:
                <input
                  type="text"
                  maxLength={20}
                  value={shortcutNext}
                  onChange={(e) => handleShortcutChange(e, setShortcutNext)}
                />
              </label>
            </div>

            <div className="shortcut-setting">
              <label>
                📖 ახსნის ჩვენება:
                <input
                  type="text"
                  maxLength={20}
                  value={
                    shortcutExplanation === ' ' ? 'Space' : shortcutExplanation
                  }
                  onChange={(e) =>
                    handleShortcutChange(e, setShortcutExplanation)
                  }
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
