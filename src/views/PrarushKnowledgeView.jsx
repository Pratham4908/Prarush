import React, { useState } from 'react';
import { 
  Layers, Search, Plus, Sparkles, BookOpen, Tag, 
  ExternalLink, CheckCircle2, ArrowRight, FileText, Folder, FileCode 
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';
import { answerKnowledgeQuery } from '../utils/prarushAI.js';
import { hasActiveApiKey } from '../utils/apiKeyManager.js';

export default function PrarushKnowledgeView({ 
  knowledgeItems = [],
  notes = [],
  documents = [],
  currentUser = null
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [qaQuestion, setQaQuestion] = useState('');
  const [groundedAnswer, setGroundedAnswer] = useState(null);
  const [isAsking, setIsAsking] = useState(false);

  // Unified index combining system knowledge, user notes, and uploaded documents
  const unifiedIndex = [
    ...knowledgeItems.map(k => ({
      id: k.id,
      title: k.title,
      source: k.source,
      snippet: k.snippet,
      type: 'knowledge',
      tags: k.tags || ['Knowledge'],
      date: k.date
    })),
    ...notes.map(n => ({
      id: n.id,
      title: n.title,
      source: 'User Markdown Note',
      snippet: n.content ? n.content.slice(0, 300) : '',
      type: 'note',
      tags: n.tags || ['Note'],
      date: n.updatedAt ? new Date(n.updatedAt).toLocaleDateString() : 'Recent'
    })),
    ...documents.map(d => ({
      id: d.id,
      title: d.name,
      source: `Uploaded Document (${d.sizeKB} KB)`,
      snippet: d.extractedContent ? d.extractedContent.slice(0, 300) : (d.summary || ''),
      type: 'document',
      tags: [d.type.toUpperCase(), 'File'],
      date: d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : 'Recent'
    }))
  ];

  const handleAskKnowledge = async (e) => {
    e.preventDefault();
    if (!qaQuestion.trim()) return;

    setIsAsking(true);
    audioSystem.playTone(600, 'sine', 0.1);

    const qLower = qaQuestion.toLowerCase();
    const queryWords = qLower.split(/\s+/).filter(w => w.length > 2);

    if (queryWords.length === 0) {
      setGroundedAnswer({
        noMatch: true,
        answer: `Please enter at least one keyword (3+ characters) to search your notes and documents.`,
        source: 'None',
        title: 'Input Too Short'
      });
      setIsAsking(false);
      return;
    }

    // Score each item by exact keyword overlap
    const scored = unifiedIndex.map(item => {
      const matches = [];
      const titleLower = item.title.toLowerCase();
      const snippetLower = item.snippet.toLowerCase();
      const sourceLower = item.source.toLowerCase();

      for (const w of queryWords) {
        if (titleLower.includes(w) || snippetLower.includes(w) || sourceLower.includes(w)) {
          matches.push(w);
        }
      }
      return { item, score: matches.length, matches };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored[0];

    // Genuine no-match handling: NEVER fall back to unifiedIndex[0]
    if (!top || top.score === 0) {
      setGroundedAnswer({
        noMatch: true,
        answer: `No matching passages found in your stored notes or documents for: "${qaQuestion}".\nTry searching with keywords that appear in your notes or uploaded files.`,
        source: 'No Source Match',
        title: 'No Matching Passages'
      });
      setIsAsking(false);
      audioSystem.playWarningSound();
      return;
    }

    // Live AI RAG synthesis if API key is active
    if (hasActiveApiKey(currentUser?.id)) {
      try {
        const topSnippets = scored.slice(0, 3).filter(s => s.score > 0).map(s => s.item);
        const aiAnswer = await answerKnowledgeQuery(qaQuestion, topSnippets, 'claude-sonnet-5-5', { userId: currentUser?.id });
        setGroundedAnswer({
          noMatch: false,
          answer: aiAnswer.text,
          source: `${top.item.source} (${aiAnswer.modelUsed})`,
          title: top.item.title,
          type: top.item.type,
          matchedTerms: top.matches.join(', '),
          isLiveAi: aiAnswer.isLiveApi
        });
        setIsAsking(false);
        audioSystem.playSuccessSound();
        return;
      } catch (ragErr) {
        console.warn('Knowledge RAG fallback to raw passage:', ragErr);
      }
    }

    // Extract the most relevant sentence from snippet
    const sentences = top.item.snippet.split(/(?<=[.?!])\s+/);
    const relevantSentence = sentences.find(s => 
      top.matches.some(m => s.toLowerCase().includes(m))
    ) || top.item.snippet.slice(0, 240);

    setGroundedAnswer({
      noMatch: false,
      answer: `Passage from ${top.item.source} ("${top.item.title}"):\n\n"${relevantSentence.trim()}"\n\nFull Reference Context:\n"${top.item.snippet}"`,
      source: top.item.source,
      title: top.item.title,
      type: top.item.type,
      matchedTerms: top.matches.join(', ')
    });

    setIsAsking(false);
    audioSystem.playSuccessSound();
  };

  const filteredItems = unifiedIndex.filter(i => 
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="prarush-view-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.14) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: 16,
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={24} color="#06b6d4" />
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Keyword &amp; Passage Search
          </h1>
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 800,
            background: 'var(--accent-cyan)',
            color: '#090d16',
            padding: '2px 8px',
            borderRadius: 999
          }}>
            {unifiedIndex.length} INDEXED SOURCES
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '6px 0 0 0', maxWidth: 680 }}>
          Performs local lexical matching across your stored notes, uploaded documents, and reference items. Extracts exact source passages without cloud dependencies or simulated scores.
        </p>
      </div>

      {/* Semantic Question Bar */}
      <form onSubmit={handleAskKnowledge} style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 14,
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <Sparkles size={20} color="#06b6d4" />
        <input
          type="text"
          placeholder="Search by keyword or topic across your documents and notes..."
          value={qaQuestion}
          onChange={(e) => setQaQuestion(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '0.92rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={isAsking}
          className="btn-primary"
          style={{ fontSize: '0.8rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>{isAsking ? 'Searching...' : 'Search Passages'}</span>
          <ArrowRight size={14} />
        </button>
      </form>

      {/* Grounded AI Answer Box */}
      {groundedAnswer && (
        <div style={{
          background: groundedAnswer.noMatch 
            ? 'rgba(244, 63, 94, 0.08)' 
            : 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(16, 185, 129, 0.06) 100%)',
          border: groundedAnswer.noMatch 
            ? '1px solid rgba(244, 63, 94, 0.3)' 
            : '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: 16,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: groundedAnswer.noMatch ? '#fb7185' : '#06b6d4' }}>
              <CheckCircle2 size={18} />
              <strong style={{ fontSize: '0.92rem' }}>
                {groundedAnswer.noMatch ? 'No Passages Found' : 'Matched Source Passage'}
              </strong>
            </div>
            {!groundedAnswer.noMatch && groundedAnswer.matchedTerms && (
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                Matched: {groundedAnswer.matchedTerms}
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.88rem', color: '#f8fafc', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
            {groundedAnswer.answer}
          </p>

          {!groundedAnswer.noMatch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Source:</span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 6,
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#38bdf8'
              }}>
                {groundedAnswer.source} ➔ {groundedAnswer.title}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Search Filter Strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          flex: 1,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 10,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Filter indexed items by keyword, note title, or file source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Unified Indexed Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16
      }}>
        {filteredItems.map(item => (
          <div
            key={item.id}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#06b6d4', fontWeight: 600 }}>
                  {item.type === 'note' ? <FileText size={13} /> : item.type === 'document' ? <Folder size={13} /> : <BookOpen size={13} />}
                  <span>{item.source}</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{item.date}</span>
              </div>

              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px 0' }}>
                {item.title}
              </h3>

              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                {item.snippet}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {item.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  style={{
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#94a3b8'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
