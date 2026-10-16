import React, { useState } from 'react';
import { 
  Sparkles, Check, X, Shield, Zap, Download, Volume2, 
  CreditCard, Award, ArrowRight, RefreshCw, AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  PLANS, 
  getSubscription, 
  isProSubscriber, 
  upgradeToPro, 
  cancelProSubscription 
} from '../utils/freemiumService.js';
import { audioSystem } from '../utils/audioSystem.js';

export default function SubscriptionModal({ isOpen, onClose, user, onSubscriptionChanged }) {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
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
      // Simulate secure payment gateway transaction
      await new Promise(resolve => setTimeout(resolve, 1200));

      const upgraded = upgradeToPro({
        billingCycle,
        paymentMethod: 'Test Card (4242)',
        email: user?.email || 'guest@citylife.app'
      });

      audioSystem.playSuccessSound();

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
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

  const handleCancelSub = () => {
    const cancelled = cancelProSubscription();
    audioSystem.playWarningSound();
    if (onSubscriptionChanged) onSubscriptionChanged(cancelled);
    setShowCancelConfirm(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="bottom-sheet" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxHeight: '92%', maxWidth: 520, margin: '0 auto' }}
      >
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#090d16'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff' }}>
                {isPro ? 'Scout Pro Membership' : 'Upgrade to Scout Pro'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 600 }}>
                {isPro ? 'Active Premium Subscription' : 'Unlock Global Urban Superpowers'}
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
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: 14,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={20} color="#f59e0b" />
                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Scout Pro Active</strong>
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  background: '#f59e0b',
                  color: '#090d16',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 999
                }}>
                  {currentSub.billingCycle?.toUpperCase()}
                </span>
              </div>

              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                <div><strong>Transaction:</strong> {currentSub.transactionId || 'TXN-ACTIVE'}</div>
                <div><strong>Renews:</strong> {new Date(currentSub.renewsAt || Date.now()).toLocaleDateString()}</div>
                <div><strong>Plan:</strong> All Pro features, unlimited Guardian SMS &amp; offline packs enabled.</div>
              </div>

              {!showCancelConfirm ? (
                <button
                  className="btn-secondary"
                  style={{ alignSelf: 'flex-start', fontSize: '0.72rem', padding: '6px 12px', color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.4)' }}
                  onClick={() => setShowCancelConfirm(true)}
                >
                  Cancel Pro Subscription
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
                    Are you sure? You will lose offline pack caching and advanced hazard routing immediately.
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn-primary"
                      style={{ background: '#f43f5e', padding: '4px 10px', fontSize: '0.72rem' }}
                      onClick={handleCancelSub}
                    >
                      Confirm Downgrade to Free
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      onClick={() => setShowCancelConfirm(false)}
                    >
                      Keep Pro
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
                    gap: 6,
                    transition: 'all 0.2s'
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
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly ($9.99/mo)
                </button>
              </div>

              {/* Pricing Display */}
              <div style={{
                textAlign: 'center',
                padding: '10px 0',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
                  {billingCycle === 'annual' ? '$6.66' : '$9.99'}
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}> / month</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: 2 }}>
                  {billingCycle === 'annual' ? 'Billed annually at $79.99/year (Save $39.89)' : 'Billed monthly, cancel anytime'}
                </div>
              </div>

              {/* Comparison Matrix */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  What Scout Pro Unlocks:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[
                    { title: 'Offline City Packs', desc: 'Download entire city vector maps & POIs for roaming without data', icon: Download },
                    { title: 'Advanced Hazard Routing', desc: 'Auto-bypass poorly lit alleys, street construction & incident hotspots', icon: Shield },
                    { title: 'Unlimited Guardian Pings', desc: 'Continuous SMS tracking & automatic emergency contact broadcasts', icon: Zap },
                    { title: 'Studio Audio Narration', desc: 'Ultra-realistic historical voice guides for 500+ heritage monuments', icon: Volume2 },
                    { title: 'Unlimited UrbanSense AI', desc: 'Instant itinerary generation, food matches & multi-district planning', icon: Sparkles }
                  ].map((feat, i) => {
                    const Icon = feat.icon;
                    return (
                      <div 
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '8px 10px',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.03)'
                        }}
                      >
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Icon size={14} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>{feat.title}</div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.3 }}>{feat.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mock Sandbox Payment Card */}
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
                    <span style={{ color: '#fff', fontWeight: 600 }}>Sandbox Test Card: </span>
                    <span style={{ color: '#38bdf8' }}>4242 •••• •••• 4242</span>
                  </div>
                </div>
                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.65rem' }}>SIMULATOR READY</span>
              </div>

              {paymentError && (
                <div style={{ color: '#fb7185', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Upgrade Action Button */}
              <button
                id="btn-confirm-upgrade"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: 13,
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#090d16',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
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
                    <span>Activate Scout Pro ({billingCycle === 'annual' ? '$79.99/yr' : '$9.99/mo'})</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Disclaimer & Policy Notice */}
              <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#64748b', lineHeight: 1.4 }}>
                14-day 100% money-back guarantee. No lock-in contracts.
                <br />
                By continuing you agree to the <a href="/terms.html" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>Terms</a> and <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>Privacy Policy</a>.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
