import React, { useState } from 'react';
import { 
  Sparkles, Image, Layers, Code, Mic, Download, Play, Square, 
  RefreshCw, Check, Copy, ArrowRight, Wand2 
} from 'lucide-react';
import { generatePrarushImage, generatePrarushImageLive, processPrarushAIQuery } from '../utils/prarushAI.js';
import { audioSystem } from '../utils/audioSystem.js';
import { isProSubscriber } from '../utils/prarushFreemium.js';

export default function PrarushContentStudioView({ onOpenSubscription, currentUser = null }) {
  const [activeTab, setActiveTab] = useState('images'); // 'images' | 'presentations' | 'code' | 'audio'
  
  // Image Generator State
  const [imagePrompt, setImagePrompt] = useState('Futuristic neon smart metropolis with autonomous flying transit and lush vertical gardens');
  const [imageStyle, setImageStyle] = useState('cinematic');
  const [generatedImage, setGeneratedImage] = useState(() => generatePrarushImage('Futuristic neon smart metropolis', 'cinematic'));
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  // Presentation Generator State
  const [deckPrompt, setDeckPrompt] = useState('AI-Driven Multi-Tenant SaaS Platform Architecture 2026');
  const [generatedDeck, setGeneratedDeck] = useState(null);
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);

  // Code Studio State
  const [codePrompt, setCodePrompt] = useState('Build a Python async microservice with rate limiting and Redis cache');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Audio Transcriber State
  const [isRecording, setIsRecording] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState(null);

  const handleGenerateImage = async () => {
    setIsGeneratingImg(true);
    audioSystem.playTone(700, 'sine', 0.1);
    try {
      const img = await generatePrarushImageLive(imagePrompt, imageStyle, { userId: currentUser?.id });
      setGeneratedImage(img);
      audioSystem.playSuccessSound();
    } catch (err) {
      console.warn('Image generation error:', err);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleGenerateDeck = async () => {
    setIsGeneratingDeck(true);
    audioSystem.playTone(600, 'sine', 0.1);
    try {
      const res = await processPrarushAIQuery(
        `Generate a pitch deck for ${deckPrompt}`, 
        'claude-sonnet-5-5',
        { userId: currentUser?.id }
      );
      setGeneratedDeck(res);
      audioSystem.playSuccessSound();
    } catch (err) {
      console.warn('Deck generation error:', err);
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    audioSystem.playTone(650, 'sine', 0.1);
    try {
      const res = await processPrarushAIQuery(
        `Generate code for ${codePrompt}`, 
        'claude-sonnet-5-5',
        { userId: currentUser?.id }
      );
      setGeneratedCode(res);
      audioSystem.playSuccessSound();
    } catch (err) {
      console.warn('Code generation error:', err);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      audioSystem.playTone(880, 'sine', 0.15);
      setTimeout(() => {
        setIsRecording(false);
        setAudioTranscript({
          text: 'Voice Memo Note: Sprint review complete. All project tasks, markdown notes, and local files are saved persistently on this device.',
          type: 'Sample Voice Note Preview',
          duration: '00:14'
        });
        audioSystem.playSuccessSound();
      }, 3500);
    } else {
      setIsRecording(false);
      audioSystem.playTone(440, 'sine', 0.1);
    }
  };

  return (
    <div className="prarush-view-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Studio Header & Sub-Tabs */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(6, 182, 212, 0.12) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 16,
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={22} color="#f59e0b" />
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              AI Content &amp; Creative Studio
            </h1>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '4px 0 0 0' }}>
            Transform natural language instructions into images, presentation decks, clean code, and voice transcripts.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 10,
          padding: 3,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto',
          maxWidth: '100%',
          scrollbarWidth: 'none'
        }}>
          {[
            { id: 'images', label: 'AI Images', icon: Image },
            { id: 'presentations', label: 'Presentations', icon: Layers },
            { id: 'code', label: 'Code Studio', icon: Code },
            { id: 'audio', label: 'Audio & Voice', icon: Mic }
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: isActive ? 'var(--accent-cyan)' : 'transparent',
                  color: isActive ? '#090d16' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={14} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. AI Image Generator View */}
      {activeTab === 'images' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 16,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              AI Visual Generation Canvas
            </h3>
            <textarea
              rows={4}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="Describe the image you want to generate in detail..."
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-glass)',
                borderRadius: 10,
                padding: 12,
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none',
                resize: 'none'
              }}
            />

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Artistic Style Preset:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['cinematic', 'cyberpunk', 'photorealistic', 'minimalist', 'abstract'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setImageStyle(s)}
                    style={{
                      fontSize: '0.68rem',
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid',
                      background: imageStyle === s ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)',
                      borderColor: imageStyle === s ? '#06b6d4' : 'rgba(255,255,255,0.1)',
                      color: imageStyle === s ? '#67e8f9' : '#cbd5e1',
                      cursor: 'pointer'
                    }}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImg}
              className="btn-primary"
              style={{ padding: 12, justifyContent: 'center', marginTop: 'auto' }}
            >
              {isGeneratingImg ? <RefreshCw size={15} className="spin-slow" /> : <Wand2 size={15} />}
              <span>{isGeneratingImg ? 'Synthesizing Visual...' : 'Generate Style Preview (1024x1024)'}</span>
            </button>
          </div>

            {/* Image Render Preview */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            alignItems: 'center'
          }}>
            {generatedImage && (
              <>
                <div style={{
                  width: '100%',
                  aspectRatio: '1/1',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                  position: 'relative'
                }}>
                  <img
                    src={generatedImage.imageUrl}
                    alt={generatedImage.prompt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    background: 'rgba(0,0,0,0.7)',
                    color: '#67e8f9',
                    fontSize: '0.62rem',
                    padding: '2px 8px',
                    borderRadius: 4
                  }}>
                    {generatedImage.resolution}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1', textAlign: 'center', fontStyle: 'italic' }}>
                  "{generatedImage.prompt}"
                </div>
                {/* Honest Demo Disclaimer Notice */}
                <div style={{
                  width: '100%',
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: '0.7rem',
                  color: '#94a3b8',
                  lineHeight: 1.4
                }}>
                  <strong style={{ color: '#38bdf8' }}>Curated Style Preview: </strong>
                  {generatedImage.disclaimer || 'Sample visual style demonstration. Connect Stability AI or Replicate in Model Hub for live diffusion models.'}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. AI Presentation Generator View */}
      {activeTab === 'presentations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 16,
            padding: 18,
            display: 'flex',
            gap: 12
          }}>
            <input
              type="text"
              value={deckPrompt}
              onChange={(e) => setDeckPrompt(e.target.value)}
              placeholder="Topic for presentation (e.g. 'Prarush Platform Architecture')..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-glass)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
            <button
              onClick={handleGenerateDeck}
              disabled={isGeneratingDeck}
              className="btn-primary"
              style={{ padding: '10px 16px' }}
            >
              {isGeneratingDeck ? <RefreshCw size={15} className="spin-slow" /> : <Layers size={15} />}
              <span>{isGeneratingDeck ? 'Generating...' : 'Generate Deck Outline Preview'}</span>
            </button>
          </div>

          {generatedDeck && generatedDeck.slides && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {generatedDeck.slides.map((s, idx) => (
                <div key={idx} style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f59e0b' }}>SLIDE 0{s.slideNumber}</span>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>16:9 Landscape</span>
                  </div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    {s.title}
                  </h4>
                  <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '0.74rem', color: '#cbd5e1' }}>
                    {s.bullets.map((b, bIdx) => (
                      <li key={bIdx} style={{ marginTop: 4 }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. AI Code Copilot View */}
      {activeTab === 'code' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 16,
            padding: 18,
            display: 'flex',
            gap: 12
          }}>
            <input
              type="text"
              value={codePrompt}
              onChange={(e) => setCodePrompt(e.target.value)}
              placeholder="Describe the function, API, or algorithm to code..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-glass)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
            <button
              onClick={handleGenerateCode}
              disabled={isGeneratingCode}
              className="btn-primary"
              style={{ padding: '10px 16px' }}
            >
              {isGeneratingCode ? <RefreshCw size={15} className="spin-slow" /> : <Code size={15} />}
              <span>{isGeneratingCode ? 'Writing Code...' : 'Generate Template Code Preview'}</span>
            </button>
          </div>

          {generatedCode && (
            <div style={{
              background: '#090d16',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              borderRadius: 14,
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.74rem',
                color: '#94a3b8'
              }}>
                <span style={{ color: '#06b6d4', fontWeight: 700 }}>{generatedCode.language.toUpperCase()} &bull; {generatedCode.modelUsed}</span>
                <span style={{ color: '#94a3b8' }}>Template Code (Syntax Highlighted Preview)</span>
              </div>
              <pre style={{
                padding: 18,
                margin: 0,
                fontSize: '0.78rem',
                color: '#e2e8f0',
                overflowX: 'auto',
                fontFamily: 'Consolas, Monaco, monospace'
              }}>
                <code>{generatedCode.code}</code>
              </pre>
              {generatedCode.disclaimer && (
                <div style={{
                  padding: '8px 14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.7rem',
                  color: '#94a3b8'
                }}>
                  {generatedCode.disclaimer}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Audio Transcriber & Voice Studio */}
      {activeTab === 'audio' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: 16,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          textAlign: 'center'
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: isRecording ? '#f43f5e' : 'rgba(6, 182, 212, 0.15)',
            border: `2px solid ${isRecording ? '#fb7185' : 'rgba(6, 182, 212, 0.4)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isRecording ? '0 0 25px #f43f5e' : 'none',
            transition: 'all 0.3s'
          }}
          onClick={handleToggleRecord}
          >
            {isRecording ? <Square size={28} color="#fff" /> : <Mic size={28} color="#06b6d4" />}
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              {isRecording ? 'Simulating Audio Capture...' : 'Record Voice Note (Audio Demo Preview)'}
            </h3>
            <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Web Audio synthesis demo. Whisper or browser speech engine required for live automatic transcription.
            </p>
          </div>

          {audioTranscript && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 12,
              padding: 16,
              maxWidth: 580,
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginBottom: 4 }}>
                VOICE NOTE DEMO (Offline Sample NLP)
              </div>
              <p style={{ fontSize: '0.82rem', color: '#f8fafc', margin: 0, lineHeight: 1.5 }}>
                {audioTranscript.text}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
