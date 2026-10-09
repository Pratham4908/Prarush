import React, { useState } from 'react';
import { Volume2, Languages, X, Sparkles, Shield, Heart } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';

export default function MultilingualPhrasebookModal({ isOpen, onClose }) {
  const [selectedLang, setSelectedLang] = useState('es');

  const LANGUAGES = [
    { code: 'es', label: 'Spanish', flag: '🇪🇸', speechCode: 'es-ES' },
    { code: 'ja', label: 'Japanese', flag: '🇯🇵', speechCode: 'ja-JP' },
    { code: 'fr', label: 'French', flag: '🇫🇷', speechCode: 'fr-FR' },
    { code: 'de', label: 'German', flag: '🇩🇪', speechCode: 'de-DE' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳', speechCode: 'hi-IN' }
  ];

  const PHRASES = {
    es: [
      { en: 'Where is the nearest police station?', local: '¿Dónde está la comisaría más cercana?', phonetic: 'DON-deh es-TAH lah co-mee-sah-REE-ah' },
      { en: 'I need urgent medical help!', local: '¡Necesito ayuda médica urgente!', phonetic: 'neh-seh-SEE-toh ah-YOO-dah MEH-dee-kah' },
      { en: 'Is it safe to walk here at night?', local: '¿Es seguro caminar por aquí de noche?', phonetic: 'es seh-GOO-roh kah-mee-NAR por ah-KEE' },
      { en: 'Can you show me the way on the map?', local: '¿Puede indicarme el camino en el mapa?', phonetic: 'PWEH-deh een-dee-KAR-meh el kah-MEE-noh' }
    ],
    ja: [
      { en: 'Where is the nearest police box (Koban)?', local: '一番近い交番はどこですか？', phonetic: 'Ichiban chikai kōban wa doko desu ka?' },
      { en: 'I need urgent medical help!', local: '緊急で医療の助けが必要です！', phonetic: 'Kinkyū de iryō no tasuke ga hitsuyō desu!' },
      { en: 'Is it safe to walk here at night?', local: '夜間にここを歩いても安全ですか？', phonetic: 'Yakan ni koko o aruite mo anzen desu ka?' },
      { en: 'Where is the nearest subway station?', local: '最寄りの地下鉄の駅はどこですか？', phonetic: 'Moyori no chikatetsu no eki wa doko desu ka?' }
    ],
    fr: [
      { en: 'Where is the nearest police station?', local: 'Où se trouve le commissariat le plus proche ?', phonetic: 'Oo suh troov luh koh-mee-sah-ryah' },
      { en: 'I need urgent medical help!', local: "J'ai besoin d'une aide médicale urgente !", phonetic: 'Zhay buh-zwan doon ed meh-dee-kahl' },
      { en: 'Is it safe to walk here at night?', local: 'Est-il prudent de marcher ici la nuit ?', phonetic: 'Eh-teel prew-dahn duh mar-shay ee-see' },
      { en: 'Can you guide me to the main boulevard?', local: 'Pouvez-vous me guider vers le grand boulevard ?', phonetic: 'Poo-vay voo muh gee-day vehr luh grahn' }
    ],
    de: [
      { en: 'Where is the nearest police station?', local: 'Wo ist die nächste Polizeiwache?', phonetic: 'Voh ist dee NEHKH-steh poh-lee-TSAI-vah-kheh' },
      { en: 'I need urgent medical help!', local: 'Ich brauche dringende medizinische Hilfe!', phonetic: 'Ikh BROW-kheh DRING-en-deh meh-dee-TSEE-nee-sheh' },
      { en: 'Is this area safe after dark?', local: 'Ist diese Gegend nach Einbruch der Dunkelheit sicher?', phonetic: 'Ist DEE-zeh GEH-gent nahkh ZIKH-er' }
    ],
    hi: [
      { en: 'Where is the nearest police station?', local: 'नज़दीकी पुलिस स्टेशन कहाँ है?', phonetic: 'Nazdeeki police station kahaan hai?' },
      { en: 'I need urgent medical help!', local: 'मुझे तत्काल चिकित्सा सहायता चाहिए!', phonetic: 'Mujhe tatkaal chikitsa sahayata chahiye!' },
      { en: 'Is this road safe at night?', local: 'क्या रात में यह रास्ता सुरक्षित है?', phonetic: 'Kya raat mein yeh raasta surakshit hai?' }
    ]
  };

  if (!isOpen) return null;

  const handleSpeakPhrase = (text, speechCode) => {
    audioSystem.speak(text);
  };

  const currentLangObj = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0];
  const phraseList = PHRASES[selectedLang] || PHRASES.es;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90%' }}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Languages size={20} color="#06b6d4" />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                Global Emergency Phrasebook
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                Instant text-to-speech in 5 languages
              </div>
            </div>
          </div>

          <button className="header-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="sheet-content">
          {/* Language selector chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`filter-chip ${selectedLang === lang.code ? 'active' : ''}`}
                onClick={() => setSelectedLang(lang.code)}
                style={{ padding: '6px 12px' }}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>

          {/* Phrases List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {phraseList.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{item.en}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>{item.local}</div>
                  <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontStyle: 'italic' }}>
                    🗣️ {item.phonetic}
                  </div>
                </div>

                <button
                  className="header-icon-btn"
                  style={{ width: 34, height: 34, background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' }}
                  onClick={() => handleSpeakPhrase(item.local, currentLangObj.speechCode)}
                  title="Pronounce Aloud"
                  aria-label={`Pronounce ${item.local}`}
                >
                  <Volume2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
