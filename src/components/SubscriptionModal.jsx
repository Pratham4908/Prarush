import React, { useState } from 'react';
import { 
  Sparkles, Check, X, Shield, Zap, Download, Cpu, 
  CreditCard, Award, ArrowRight, RefreshCw, AlertCircle, Layers 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  PRARUSH_PLANS, 
  getSubscription, 
  isProSubscriber, 
  isTeamSubscriber,
  upgradeSubscription, 
  cancelSubscription 
} from '../utils/prarushFreemium.js';
import { audioSystem } from '../utils/audioSystem.js';

export default function SubscriptionModal({ isOpen, onClose, user, onSubscriptionChanged }) {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [selectedTier, setSelectedTier] = useState('pro'); // 'pro' | 'team'
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  if (!isOpen) return null;

  const currentSub = getSubscription();
  const isPro = isProSubscriber();

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1100));

      const upgraded = upgradeSubscription(
        selectedTier,
        billingCycle,
        user?.email || 'user@prarush.ai'
      );

      audioSystem.playSuccessSound();

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });

      if (onSubscriptionChanged) onSubscriptionChanged(upgraded);
      setIsProcessing(false);
      onClose();
    } catch (err) {
      setPaymentError(err.message || 'Payment simulation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    const cancelled = cancelSubscription();
    audioSystem.playWarningSound();
    if (onSubscriptionChanged) onSubscriptionChanged(cancelled);
    setShowCancelConfirm(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="bottom-sheet" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxHeight: '92%', maxWidth: 560, margin: '0 auto' }}
      >
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                {isPro ? 'Manage Prarush Membership' : 'Upgrade to Prarush Pro / Team'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 600 }}>
                {isPro ? 'Active Premium Entitlement' : 'Unlock Claude 3.5, GPT-4o & Unlimited Automations'}
              </div>
            </div>
          </div>

          <button className="header-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="sheet-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Active Subscription View */}
          {isPro ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              borderRadius: 14,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={20} color="#06b6d4" />
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                    {currentSub.planId === 'team' ? 'Prarush Team Active' : 'Prarush Pro Active'}
                  </strong>
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  background: 'var(--accent-cyan)',
                  color: '#090d16',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 999
                }}>
                  {currentSub.billingCycle?.toUpperCase()}
                </span>
              </div>

              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                <div><strong>Transaction:</strong> {currentSub.transactionId || 'PRARUSH-TXN-ACTIVE'}</div>
                <div><strong>Renews:</strong> {new Date(currentSub.renewsAt || Date.now()).toLocaleDateString()}</div>
                <div><strong>Benefits:</strong> Claude 3.5 Sonnet, GPT-4o, 50GB storage, and unlimited AI Automation Studio.</div>
              </div>

              {!showCancelConfirm ? (
                <button
                  className="btn-secondary"
                  style={{ alignSelf: 'flex-start', fontSize: '0.72rem', padding: '6px 12px', color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.4)' }}
                  onClick={() => setShowCancelConfirm(true)}
                >
                  Cancel Subscription
                </button>
              ) : (
                <div style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  borderRadius: 10,
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  <span style={{ fontSize: '0.72rem', color: '#fca5a5' }}>
                    Are you sure? You will lose Claude 3.5 access, AI Automation Studio, and high-compute storage immediately.
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn-primary"
                      style={{ background: '#f43f5e', padding: '5px 12px', fontSize: '0.72rem' }}
                      onClick={handleCancel}
                    >
                      Confirm Downgrade to Free
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ padding: '5px 12px', fontSize: '0.72rem' }}
                      onClick={() => setShowCancelConfirm(false)}
                    >
                      Keep Active
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Billing Cycle Toggle */}
              <div style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 12,
                padding: 4,
                border: '1px solid var(--border-glass)'
              }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 9,
                    border: 'none',
                    background: billingCycle === 'annual' ? 'var(--accent-cyan)' : 'transparent',
                    color: billingCycle === 'annual' ? '#090d16' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                  onClick={() => setBillingCycle('annual')}
                >
                  <span>Annual Billing</span>
                  <span style={{
                    fontSize: '0.62rem',
                    background: billingCycle === 'annual' ? '#090d16' : 'rgba(16, 185, 129, 0.2)',
                    color: billingCycle === 'annual' ? '#38bdf8' : '#10b981',
                    padding: '2px 6px',
                    borderRadius: 999,
                    fontWeight: 800
                  }}>
                    SAVE 33%
                  </span>
                </button>

                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 9,
                    border: 'none',
                    background: billingCycle === 'monthly' ? 'var(--accent-cyan)' : 'transparent',
                    color: billingCycle === 'monthly' ? '#090d16' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </button>
              </div>

              {/* Tier Selector (Pro vs Team) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div
                  onClick={() => setSelectedTier('pro')}
                  style={{
                    border: selectedTier === 'pro' ? '2px solid #06b6d4' : '1px solid var(--border-glass)',
                    borderRadius: 12,
                    padding: 12,
                    background: selectedTier === 'pro' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Prarush Pro</strong>
                    <span style={{ fontSize: '0.62rem', background: '#06b6d4', color: '#090d16', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>POPULAR</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginTop: 4 }}>
                    {billingCycle === 'annual' ? '$8' : '$12'}
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: 2 }}>
                    For power developers, researchers &amp; creators.
                  </div>
                </div>

                <div
                  onClick={() => setSelectedTier('team')}
                  style={{
                    border: selectedTier === 'team' ? '2px solid #f59e0b' : '1px solid var(--border-glass)',
                    borderRadius: 12,
                    padding: 12,
                    background: selectedTier === 'team' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Prarush Team</strong>
                    <span style={{ fontSize: '0.62rem', background: '#f59e0b', color: '#090d16', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>BUSINESS</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginTop: 4 }}>
                    {billingCycle === 'annual' ? '$23' : '$29'}
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/seat/mo</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: 2 }}>
                    Shared workspaces, audit logs &amp; webhooks.
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  'Access Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro',
                  'Unlimited workspaces, Kanban boards, and notes',
                  'Visual AI Automation Studio with webhook triggers',
                  'AI Image Generator & Presentation Deck builder',
                  'Document OCR, entity extractor & file compressor',
                  '50 GB secure cloud storage with GDPR data portability'
                ].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#cbd5e1' }}>
                    <Check size={14} color="#10b981" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Sandbox Test Card Indicator */}
              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px dashed rgba(6, 182, 212, 0.4)',
                borderRadius: 10,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CreditCard size={16} color="#06b6d4" />
                  <div>
                    <span style={{ color: '#fff', fontWeight: 600 }}>Simulated Card: </span>
                    <span style={{ color: '#38bdf8' }}>4242 •••• •••• 4242</span>
                  </div>
                </div>
                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.65rem' }}>SANDBOX READY</span>
              </div>

              {paymentError && (
                <div style={{ color: '#fb7185', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Upgrade Button */}
              <button
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: 13,
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
                  justifyContent: 'center'
                }}
                onClick={handleUpgrade}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={16} className="spin-slow" />
                    <span>Processing Sandbox Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Activate {selectedTier === 'team' ? 'Prarush Team' : 'Prarush Pro'} ({billingCycle === 'annual' ? `$${selectedTier === 'team' ? '276' : '96'}/year` : `$${selectedTier === 'team' ? '29' : '12'}/mo`})</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.66rem', color: '#64748b' }}>
                14-day 100% money-back guarantee &bull; Cancel anytime from settings.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
