import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, Upload, FileText, FileCode, CheckCircle2, Download, 
  Trash2, RefreshCw, Sparkles, HardDrive, Eye, Archive, ArrowRight, AlertCircle, File, Lock, Check 
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';
import { 
  saveFileToIndexedDB, 
  getFileFromIndexedDB, 
  deleteFileFromIndexedDB, 
  getBrowserStorageUsage 
} from '../utils/indexedDbStore.js';
import { compressBlob } from '../utils/compressionEngine.js';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [storageEstimate, setStorageEstimate] = useState({ usedMB: '0.00', quotaMB: 'N/A' });

  const fileInputRef = useRef(null);

  useEffect(() => {
    getBrowserStorageUsage().then(setStorageEstimate);
  }, [documents.length]);

  const handleFileClick = () => {
    setUploadError('');
    fileInputRef.current?.click();
  };

  const handleRealFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 15 MB local processing limit
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File exceeds 15 MB local limit. Please upload a smaller file.');
      audioSystem.playWarningSound();
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);

    const isTextual = file.type.includes('text') || 
                      file.name.endsWith('.md') || 
                      file.name.endsWith('.txt') || 
                      file.name.endsWith('.json') || 
                      file.name.endsWith('.csv');

    const docId = `doc-${Date.now()}`;

    // PERSIST AUTHENTIC UPLOADED BYTES TO INDEXEDDB (Verify success)
    let isPersisted = false;
    try {
      isPersisted = await saveFileToIndexedDB(docId, file);
    } catch (dbErr) {
      console.warn('IndexedDB write warning:', dbErr);
      isPersisted = false;
    }

    if (!isPersisted) {
      setUploadError(`Storage Note: Could not write ${file.name} to IndexedDB. File is accessible in temporary session memory only.`);
    }

    const reader = new FileReader();

    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const pct = Math.round((evt.loaded / evt.total) * 65) + 25;
        setUploadProgress(pct);
      }
    };

    reader.onload = () => {
      setUploadProgress(100);
      const rawContent = isTextual ? reader.result : '';
      const wordCount = isTextual ? rawContent.split(/\s+/).filter(Boolean).length : 0;

      const newDoc = {
        id: docId,
        workspaceId: currentWorkspace.id,
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : (file.type.includes('image') ? 'image' : 'text'),
        sizeKB: Math.round(file.size / 1024),
        uploadedAt: new Date().toISOString(),
        summary: isPersisted 
          ? (isTextual 
              ? `Text Document parsed: ${wordCount} words, ${rawContent.length} characters. Persisted in IndexedDB.` 
              : `Binary file (${file.type || 'file'}) preserved in IndexedDB with authentic raw bytes.`)
          : `File held in temporary session memory only (IndexedDB save was not completed).`,
        extractedContent: isTextual ? rawContent : '',
        ocrText: isTextual 
          ? rawContent.slice(0, 800) + (rawContent.length > 800 ? '...' : '') 
          : `[Binary Content: ${file.name}, ${Math.round(file.size / 1024)} KB, ${isPersisted ? 'persisted in IndexedDB' : 'session memory only'}]`,
        status: isPersisted ? 'persisted' : 'memory_only',
        isPersistedInIndexedDB: isPersisted,
        hasRealBinary: true,
        isSample: false
      };

      setTimeout(() => {
        onUploadDocument(newDoc);
        setSelectedDoc(newDoc);
        setIsUploading(false);
        setUploadProgress(0);
        audioSystem.playSuccessSound();
      }, 350);
    };

    reader.onerror = () => {
      setIsUploading(false);
      setUploadError('Failed to read file contents from device.');
      audioSystem.playWarningSound();
    };

    if (isTextual) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }

    e.target.value = '';
  };

  const handleParseOrExtract = () => {
    if (!selectedDoc) return;
    setIsProcessingOCR(true);
    setOcrResult(null);
    audioSystem.playTone(600, 'sine', 0.1);

    setTimeout(() => {
      if (selectedDoc.extractedContent) {
        setOcrResult(`PARSED TEXT CONTENT (${selectedDoc.name}):\n\n${selectedDoc.extractedContent}`);
      } else {
        setOcrResult(`OPTICAL OCR STATUS (${selectedDoc.name}):\n\nThis is a binary file (${selectedDoc.sizeKB} KB) stored persistently in your browser's IndexedDB.\n\nNote: Optical character recognition for binary PDFs/images requires an optical OCR microservice (e.g. Tesseract.js / Cloud Vision). Client-side text parsing is fully active for text, Markdown, JSON, and CSV files.`);
      }
      setIsProcessingOCR(false);
      audioSystem.playSuccessSound();
    }, 400);
  };

  const handleCompressFile = async () => {
    if (!selectedDoc) return;

    // Retrieve authentic blob from IndexedDB
    let blob = await getFileFromIndexedDB(selectedDoc.id);

    // If real text document uploaded by user
    if (!blob && selectedDoc.extractedContent && !selectedDoc.isSample) {
      blob = new Blob([selectedDoc.extractedContent], { type: 'text/plain;charset=utf-8' });
    }

    if (!blob) {
      audioSystem.playWarningSound();
      setCompressionResult({
        success: false,
        error: 'Compression unavailable for sample metadata records. Upload an authentic file from your device to perform native GZIP stream compression.'
      });
      return;
    }

    setIsCompressing(true);
    setCompressionResult(null);
    audioSystem.playTone(650, 'sine', 0.1);

    try {
      const compRes = await compressBlob(blob);

      setCompressionResult({
        success: true,
        originalKB: (compRes.originalSize / 1024).toFixed(1),
        compressedKB: (compRes.compressedSize / 1024).toFixed(1),
        savingsPercent: compRes.savingsPercent,
        compressedBlob: compRes.compressedBlob,
        archiveName: `${selectedDoc.name.replace(/^\[Sample\]\s*/, '')}.gz`
      });

      audioSystem.playSuccessSound();
    } catch (err) {
      setCompressionResult({
        success: false,
        error: `Compression error: ${err.message}`
      });
      audioSystem.playWarningSound();
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownloadCompressedArchive = () => {
    if (!compressionResult || !compressionResult.compressedBlob) return;
    const url = URL.createObjectURL(compressionResult.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = compressionResult.archiveName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    audioSystem.playSuccessSound();
  };

  const handleDownloadDoc = async () => {
    if (!selectedDoc) return;

    // 1. Check if the authentic raw file is stored in IndexedDB across reloads
    try {
      const persistedBlob = await getFileFromIndexedDB(selectedDoc.id);
      if (persistedBlob) {
        const url = URL.createObjectURL(persistedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedDoc.name.replace(/^\[Sample\]\s*/, '');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        audioSystem.playSuccessSound();
        return;
      }
    } catch (err) {
      console.warn('IndexedDB fetch error during download:', err);
    }

    // 2. Real user uploaded text documents
    if (!selectedDoc.isSample && selectedDoc.extractedContent) {
      const blob = new Blob([selectedDoc.extractedContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedDoc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      audioSystem.playSuccessSound();
      return;
    }

    // 3. For sample records without raw binary payload, do not fabricate fake binary download
    audioSystem.playWarningSound();
    alert(`Binary Download Unavailable for Sample Record:\n\n"${selectedDoc.name}" is an illustrative sample metadata card without stored binary bytes on this browser.\n\nTo download original files and test persistent storage, upload an authentic file from your computer using the "Upload File" button.`);
  };

  const handleDelete = async (docId) => {
    await deleteFileFromIndexedDB(docId);
    onDeleteDocument(docId);
    if (selectedDoc?.id === docId) setSelectedDoc(null);
    audioSystem.playTone(400, 'sine', 0.08);
  };

  const totalStorageKB = documents.reduce((acc, d) => acc + (d.sizeKB || 0), 0);
  const totalStorageMB = (totalStorageKB / 1024).toFixed(2);
  const isBinaryDoc = selectedDoc?.type === 'pdf' || selectedDoc?.type === 'image';

  return (
    <div className="prarush-view-content" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, height: '100%' }}>
      {/* Hidden Real File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleRealFileUpload}
        accept=".txt,.md,.json,.csv,.pdf,image/*"
        style={{ display: 'none' }}
      />

      {/* Left Column: File Explorer */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: '16px',
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
            onClick={handleFileClick}
            disabled={isUploading}
            className="btn-primary"
            style={{ fontSize: '0.72rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Upload size={13} />
            <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
          </button>
        </div>

        {/* Upload Progress or Error */}
        {isUploading && (
          <div style={{
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: '0.72rem',
            color: '#38bdf8'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Writing to IndexedDB...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#06b6d4', transition: 'width 0.2s ease' }} />
            </div>
          </div>
        )}

        {uploadError && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: '0.72rem',
            color: '#f43f5e',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <AlertCircle size={14} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Local Storage Meter (Accurate representation) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 10,
          padding: 12,
          fontSize: '0.72rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#94a3b8' }}>Browser Storage Quota:</span>
            <strong style={{ color: '#fff' }}>{storageEstimate.usedMB} MB used</strong>
          </div>
          <div style={{ fontSize: '0.66rem', color: '#64748b', marginBottom: 6 }}>
            Tracked Documents: {documents.length} files ({totalStorageMB} MB metadata) &bull; Device quota: {storageEstimate.quotaMB !== 'N/A' ? (storageEstimate.quotaMB / 1024).toFixed(1) + ' GB' : 'Dynamic'}
          </div>
          <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, Math.max(1, (parseFloat(storageEstimate.usedMB) / (parseFloat(storageEstimate.quotaMB) || 1000)) * 100))}%`, height: '100%', background: 'var(--accent-cyan)' }} />
          </div>
        </div>

        {/* Files List */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '0.8rem' }}>
              No files uploaded yet. Click Upload File above to add docs or images.
            </div>
          ) : (
            documents.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: isSelected ? 'rgba(6, 182, 212, 0.14)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <FileText size={16} color={isSelected ? '#06b6d4' : '#94a3b8'} style={{ flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: isSelected ? '#fff' : '#cbd5e1',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                        {doc.sizeKB} KB • {doc.type.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc.id);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: 4
                    }}
                    title="Delete file"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: File Workspace Canvas */}
      {selectedDoc ? (
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          overflowY: 'auto'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.4rem' }}>📄</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {selectedDoc.name}
                </h2>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Uploaded: {new Date(selectedDoc.uploadedAt).toLocaleDateString()} &bull; Size: {selectedDoc.sizeKB} KB &bull;{' '}
                {selectedDoc.isSample 
                  ? <span style={{ color: '#f59e0b', fontWeight: 600 }}>Sample Metadata Card (Binary Not on Device)</span>
                  : selectedDoc.isPersistedInIndexedDB 
                    ? <span style={{ color: '#10b981', fontWeight: 600 }}>Persisted in Browser IndexedDB ✓</span>
                    : <span style={{ color: '#fb7185', fontWeight: 600 }}>Session Memory Only (IndexedDB Write Failed)</span>
                }
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Parse/OCR Control */}
              <button
                onClick={handleParseOrExtract}
                disabled={isProcessingOCR}
                className="btn-primary"
                style={{ fontSize: '0.78rem', padding: '8px 12px' }}
                title={isBinaryDoc ? 'OCR requires backend service' : 'Parse text content'}
              >
                {isBinaryDoc ? <Lock size={14} /> : <FileText size={14} />}
                <span>
                  {isProcessingOCR 
                    ? 'Processing...' 
                    : isBinaryDoc 
                      ? 'Optical OCR (Backend Required)' 
                      : 'Parse Document Text'}
                </span>
              </button>

              {/* Real Stream Compression */}
              <button
                onClick={handleCompressFile}
                disabled={isCompressing || (selectedDoc?.isSample && !selectedDoc?.hasRealBinary)}
                className="btn-secondary"
                style={{
                  fontSize: '0.78rem',
                  padding: '8px 12px',
                  opacity: (selectedDoc?.isSample && !selectedDoc?.hasRealBinary) ? 0.6 : 1,
                  cursor: (selectedDoc?.isSample && !selectedDoc?.hasRealBinary) ? 'not-allowed' : 'pointer'
                }}
                title={(selectedDoc?.isSample && !selectedDoc?.hasRealBinary) ? 'Upload an authentic file to enable native GZIP compression' : 'Perform authentic GZIP stream compression'}
              >
                <Archive size={14} />
                <span>
                  {isCompressing 
                    ? 'Compressing...' 
                    : (selectedDoc?.isSample && !selectedDoc?.hasRealBinary) 
                      ? 'Compress (Upload Required)' 
                      : 'Compress (GZIP)'}
                </span>
              </button>

              {/* Download authentic bytes */}
              <button
                onClick={handleDownloadDoc}
                disabled={selectedDoc?.isSample && !selectedDoc?.hasRealBinary}
                className="btn-secondary"
                style={{
                  fontSize: '0.78rem',
                  padding: '8px 12px',
                  opacity: (selectedDoc?.isSample && !selectedDoc?.hasRealBinary) ? 0.6 : 1,
                  cursor: (selectedDoc?.isSample && !selectedDoc?.hasRealBinary) ? 'not-allowed' : 'pointer'
                }}
                title={(selectedDoc?.isSample && !selectedDoc?.hasRealBinary) ? 'Sample metadata card. Upload an authentic file to download binary bytes' : 'Download original file bytes from IndexedDB'}
              >
                <Download size={14} />
                <span>
                  {(selectedDoc?.isSample && !selectedDoc?.hasRealBinary) 
                    ? 'Download (Upload Required)' 
                    : 'Download Original'}
                </span>
              </button>
            </div>
          </div>

          {/* AI Executive Summary Card */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.06)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: 12,
            padding: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Sparkles size={16} color="#06b6d4" />
              <strong style={{ fontSize: '0.85rem', color: '#38bdf8' }}>Document Analysis &amp; IndexedDB Status</strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>
              {selectedDoc.summary}
            </p>
          </div>

          {/* OCR / Parsed Text Display */}
          {ocrResult && (
            <div style={{
              background: '#090d16',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 12,
              padding: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#10b981' }}>
                <CheckCircle2 size={16} />
                <strong style={{ fontSize: '0.85rem' }}>Parsed Content</strong>
              </div>
              <pre style={{
                fontSize: '0.8rem',
                color: '#cbd5e1',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                margin: 0,
                maxHeight: 250,
                overflowY: 'auto',
                lineHeight: 1.4
              }}>
                {ocrResult}
              </pre>
            </div>
          )}

          {/* Real Compression Results Display with Authentic Download */}
          {compressionResult && (
            <div style={{
              background: compressionResult.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
              border: `1px solid ${compressionResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              borderRadius: 12,
              padding: 16,
              fontSize: '0.8rem',
              color: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: compressionResult.success ? '#10b981' : '#fb7185' }}>
                  {compressionResult.success ? 'Real GZIP Stream Compression Complete ✓' : 'Compression Failed'}
                </strong>
                {compressionResult.success && (
                  <span style={{ fontSize: '0.7rem', background: '#10b98122', color: '#10b981', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                    {compressionResult.savingsPercent}% REAL SAVINGS
                  </span>
                )}
              </div>

              {compressionResult.success ? (
                <>
                  <div>
                    Original: <strong>{compressionResult.originalKB} KB</strong> ➔ GZIP Compressed: <strong style={{ color: '#10b981' }}>{compressionResult.compressedKB} KB</strong>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Compressed using browser native <code>CompressionStream('gzip')</code>. An authentic gzip binary archive was generated.
                  </div>
                  <button
                    onClick={handleDownloadCompressedArchive}
                    className="btn-primary"
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: '0.75rem',
                      padding: '6px 14px',
                      marginTop: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Download size={13} />
                    <span>Download Compressed Archive ({compressionResult.archiveName})</span>
                  </button>
                </>
              ) : (
                <div style={{ color: '#fb7185' }}>{compressionResult.error}</div>
              )}
            </div>
          )}

          {/* Document Content Preview */}
          <div style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 12,
            padding: 18,
            overflowY: 'auto'
          }}>
            <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
              Preview &amp; Indexed Content
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
              {selectedDoc.extractedContent || selectedDoc.ocrText || selectedDoc.summary}
            </p>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          color: '#64748b'
        }}>
          <Folder size={48} />
          <p style={{ margin: 0 }}>Select or upload a document to view details, compress, and download</p>
        </div>
      )}
    </div>
  );
}
