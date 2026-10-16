import React, { useState } from 'react';
import { 
  Folder, Upload, FileText, FileCode, CheckCircle2, Download, 
  Trash2, RefreshCw, Sparkles, HardDrive, Eye, Archive, ArrowRight 
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';
import { isProSubscriber } from '../utils/prarushFreemium.js';

export default function PrarushDocumentsView({
  documents = [],
  currentWorkspace,
  onUploadDocument,
  onDeleteDocument,
  onOpenSubscription
}) {
  const [selectedDoc, setSelectedDoc] = useState(documents[0] || null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState(null);

  const handleSimulatedUpload = () => {
    const sampleFiles = [
      { name: 'Machine-Learning-Research-Report.pdf', type: 'pdf', sizeKB: 3200 },
      { name: 'Sprint-Retrospective-Diagram.png', type: 'image', sizeKB: 1450 },
      { name: 'Company-Financial-Ledger-2026.xlsx', type: 'sheet', sizeKB: 780 }
    ];
    const picked = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];

    const newDoc = {
      id: `doc-${Date.now()}`,
      workspaceId: currentWorkspace.id,
      name: picked.name,
      type: picked.type,
      sizeKB: picked.sizeKB,
      uploadedAt: new Date().toISOString(),
      summary: 'Uploaded file automatically indexed and pre-processed for OCR entity extraction.',
      ocrText: 'EXTRACTED OCR CONTENT: Document contains structured metadata, system specifications, and performance targets.',
      status: 'analyzed'
    };

    onUploadDocument(newDoc);
    setSelectedDoc(newDoc);
    audioSystem.playSuccessSound();
  };

  const handleExtractOCR = () => {
    if (!selectedDoc) return;
    setIsProcessingOCR(true);
    audioSystem.playTone(600, 'sine', 0.1);

    setTimeout(() => {
      setOcrResult(`OCR EXTRACTED TEXT FROM ${selectedDoc.name}:\n\n"Prarush platform specification. Features integrated AI Model Hub, multi-agent communication protocols, client-side session encryption, and automated test runners with 100% green verification."`);
      setIsProcessingOCR(false);
      audioSystem.playSuccessSound();
    }, 700);
  };

  const handleCompressFile = () => {
    if (!selectedDoc) return;
    setIsCompressing(true);
    audioSystem.playTone(650, 'sine', 0.1);

    setTimeout(() => {
      const reduced = Math.round(selectedDoc.sizeKB * 0.38);
      setCompressionResult(`Compressed from ${selectedDoc.sizeKB} KB to ${reduced} KB (62% Space Saved!)`);
      setIsCompressing(false);
      audioSystem.playSuccessSound();
    }, 600);
  };

  return (
    <div className="prarush-view-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: 16 }}>
      {/* Left Column: Documents Directory & Storage Gauge */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Folder size={20} color="#10b981" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Files &amp; Documents
            </h3>
          </div>
          <button
            onClick={handleSimulatedUpload}
            className="btn-primary"
            style={{ fontSize: '0.72rem', padding: '6px 10px' }}
          >
            <Upload size={13} />
            <span>Upload File</span>
          </button>
        </div>

        {/* Cloud Storage Meter */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 10,
          padding: 12,
          fontSize: '0.72rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#94a3b8' }}>Storage Consumed:</span>
            <strong style={{ color: '#fff' }}>6.8 MB / {isProSubscriber() ? '50 GB' : '500 MB'}</strong>
          </div>
          <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: '4%', height: '100%', background: 'var(--accent-cyan)' }} />
          </div>
        </div>

        {/* Files List */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {documents.map(doc => {
            const isSelected = selectedDoc?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedDoc(doc);
                  setOcrResult(null);
                  setCompressionResult(null);
                  audioSystem.playTone(600, 'sine', 0.06);
                }}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <FileText size={18} color={isSelected ? '#10b981' : '#94a3b8'} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.name}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                    {doc.sizeKB} KB &bull; {doc.type.toUpperCase()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: File Details, OCR, Summarizer, Compressor */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        {selectedDoc ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {selectedDoc.name}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  Uploaded {new Date(selectedDoc.uploadedAt).toLocaleDateString()} &bull; {selectedDoc.sizeKB} KB
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleExtractOCR}
                  disabled={isProcessingOCR}
                  className="btn-primary"
                  style={{ fontSize: '0.74rem', padding: '6px 12px' }}
                >
                  {isProcessingOCR ? <RefreshCw size={14} className="spin-slow" /> : <Eye size={14} />}
                  <span>Extract OCR Text</span>
                </button>

                <button
                  onClick={handleCompressFile}
                  disabled={isCompressing}
                  className="btn-secondary"
                  style={{ fontSize: '0.74rem', padding: '6px 12px' }}
                >
                  {isCompressing ? <RefreshCw size={14} className="spin-slow" /> : <Archive size={14} />}
                  <span>Compress (62%)</span>
                </button>
              </div>
            </div>

            {/* Document AI Summary */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 12,
              padding: 14
            }}>
              <div style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, marginBottom: 4 }}>
                AI EXECUTIVE SUMMARY
              </div>
              <p style={{ fontSize: '0.8rem', color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>
                {selectedDoc.summary}
              </p>
            </div>

            {/* OCR Extracted Text Output */}
            {ocrResult && (
              <div style={{
                background: '#090d16',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: 12,
                padding: 14
              }}>
                <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginBottom: 6 }}>
                  OPTICAL CHARACTER RECOGNITION (OCR) OUTPUT
                </div>
                <pre style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {ocrResult}
                </pre>
              </div>
            )}

            {/* Compression Feedback */}
            {compressionResult && (
              <div style={{
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid #38bdf8',
                borderRadius: 10,
                padding: 10,
                fontSize: '0.75rem',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <CheckCircle2 size={16} />
                <span>{compressionResult}</span>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            No document selected. Upload or pick a file on the left.
          </div>
        )}
      </div>
    </div>
  );
}
