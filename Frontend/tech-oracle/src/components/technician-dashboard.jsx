"use client"
import React, { useState, useEffect } from 'react';
import './technician-dashboard.css';

// RepairGuideFormatter Component
const RepairGuideFormatter = ({ repairGuide }) => {
  console.log('Repair Guide:', repairGuide);

  /**
   * Parse the structured repair guide text into discrete sections.
   * The SOURCING section uses a pipe-delimited format per line:
   *   COMPONENT_NAME | COMPATIBILITY_NOTE | ESTIMATED_PRICE_ZAR | RETAILER_NAME | RETAILER_URL
   */
  const parseRepairGuide = (guide) => {
    if (!guide) {
      console.warn('Guide is empty or null');
      return null;
    }

    const sections = {
      complexity: '',
      tools: [],
      stepByStep: [],
      testing: [],
      sourcing: [], // Array of { name, compatibilityNote, priceZar, retailerName, retailerUrl }
    };

    // ── Complexity ──────────────────────────────────────────────────────────
    const complexityMatch = guide.match(/\*\*COMPLEXITY_START\*\*\s*([\s\S]*?)\s*\*\*COMPLEXITY_END\*\*/);
    if (complexityMatch) {
      const complexityValue = complexityMatch[1].trim();
      const numMatch = complexityValue.match(/(\d+)/);
      sections.complexity = numMatch ? `${numMatch[1]}/10` : complexityValue;
    } else {
      console.warn('Failed to match complexity section');
    }

    // ── Tools ────────────────────────────────────────────────────────────────
    const toolsMatch = guide.match(/\*\*TOOLS_START\*\*\s*([\s\S]*?)\s*\*\*TOOLS_END\*\*/);
    if (toolsMatch) {
      sections.tools = toolsMatch[1]
        .trim()
        .split('\n')
        .map(item => item.replace(/^[-•*]\s*/, '').trim())
        .filter(item => item !== '' && item.length > 2);
    } else {
      console.warn('Failed to match tools section');
    }

    // ── Steps ────────────────────────────────────────────────────────────────
    const stepsMatch = guide.match(/\*\*STEPS_START\*\*\s*([\s\S]*?)\s*\*\*STEPS_END\*\*/);
    if (stepsMatch) {
      sections.stepByStep = stepsMatch[1]
        .trim()
        .split('\n')
        .map(item => item.replace(/^(\d+\.|\d+\)|-|•|\\*)\s*/, '').trim())
        .filter(item => item !== '' && item.length > 3);
    } else {
      console.warn('Failed to match steps section');
    }

    // ── Testing ──────────────────────────────────────────────────────────────
    const testingMatch = guide.match(/\*\*TESTING_START\*\*\s*([\s\S]*?)\s*\*\*TESTING_END\*\*/);
    if (testingMatch) {
      sections.testing = testingMatch[1]
        .trim()
        .split('\n')
        .map(item => item.replace(/^(Test\s*\d+:?|\d+\.|\d+\)|-|•|\\*)\s*/i, '').trim())
        .filter(item => item !== '' && item.length > 3);
    } else {
      console.warn('Failed to match testing section');
    }

    // ── Sourcing & Compatibility ─────────────────────────────────────────────
    // Each non-empty line inside the block must follow the pipe format:
    //   COMPONENT_NAME | COMPATIBILITY_NOTE | ESTIMATED_PRICE_ZAR | RETAILER_NAME | RETAILER_URL
    const sourcingMatch = guide.match(/\*\*SOURCING_START\*\*\s*([\s\S]*?)\s*\*\*SOURCING_END\*\*/);
    if (sourcingMatch) {
      const lines = sourcingMatch[1]
        .trim()
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && l.includes('|'));

      sections.sourcing = lines.map(line => {
        const parts = line.split('|').map(p => p.trim());
        return {
          name: parts[0] || '',
          compatibilityNote: parts[1] || '',
          priceZar: parts[2] || '',
          retailerName: parts[3] || '',
          retailerUrl: parts[4] || '',
        };
      }).filter(item => item.name.length > 0);
    } else {
      console.warn('Sourcing section not present in this guide (older record or model skipped it)');
    }

    console.log('Final parsed sections:', sections);
    return sections;
  };

  const getComplexityIcon = (complexity) => {
    const level = parseInt(complexity.match(/(\d+)/)?.[1] || '0');
    return level <= 6 ? '✅' : '⚠️';
  };

  if (!repairGuide) {
    return (
      <div className="repair-guide-alert repair-guide-alert-info">
        ℹ️ No repair guide generated yet
      </div>
    );
  }

  const sections = parseRepairGuide(repairGuide);

  if (!sections) {
    return (
      <div className="repair-guide-alert repair-guide-alert-error">
        ❌ Unable to parse repair guide
      </div>
    );
  }

  /**
   * Format a ZAR price string for display.
   * If the value is a plain number string, prefix with "R ".
   * If the model already included "R" or "ZAR", surface it as-is.
   */
  const formatZar = (raw) => {
    if (!raw) return 'Price unavailable';
    const cleaned = raw.replace(/[Rr]\s*/g, '').replace(/ZAR\s*/gi, '').trim();
    const num = parseFloat(cleaned.replace(/,/g, ''));
    if (!isNaN(num)) {
      return `R ${num.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return raw; // Return original if we cannot parse it
  };

  return (
    <div className="repair-guide-container">

      {/* ── Complexity Level ──────────────────────────────────────────── */}
      <div className="repair-guide-card">
        <div className="repair-guide-header">
          <span>{getComplexityIcon(sections.complexity)}</span>
          <span>Complexity Level</span>
        </div>
        <div className="repair-guide-complexity">
          {sections.complexity}
        </div>
      </div>

      {/* ── Required Tools ───────────────────────────────────────────── */}
      <div className="repair-guide-card">
        <div className="repair-guide-header">
          <span>🔧</span>
          <span>Required Tools &amp; Components</span>
        </div>
        <ul className="repair-guide-list">
          {sections.tools.map((tool, index) => (
            <li key={index}>{tool}</li>
          ))}
        </ul>
      </div>

      {/* ── Step-by-Step Guide ────────────────────────────────────────── */}
      <div className="repair-guide-card">
        <div className="repair-guide-header">
          <span>📋</span>
          <span>Step-by-Step Repair Guide</span>
        </div>
        <div>
          {sections.stepByStep.map((step, index) => (
            <div key={index} className="repair-guide-step">
              <div className="repair-guide-step-number">{index + 1}</div>
              <div className="repair-guide-step-content">{step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Testing Guide ─────────────────────────────────────────────── */}
      <div className="repair-guide-card">
        <div className="repair-guide-header">
          <span>✅</span>
          <span>Testing Guide</span>
        </div>
        <div>
          {sections.testing.map((test, index) => (
            <div key={index} className="repair-guide-step">
              <div className="repair-guide-test-number">{index + 1}</div>
              <div className="repair-guide-step-content">{test}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sourcing & Compatibility ──────────────────────────────────── */}
      {sections.sourcing && sections.sourcing.length > 0 && (
        <div className="repair-guide-card repair-guide-card--sourcing">
          <div className="repair-guide-header">
            <span>🛒</span>
            <span>Sourcing &amp; Compatibility</span>
          </div>

          <p className="repair-guide-sourcing-subtitle">
            Best-value parts verified for this device — ships within South Africa.
          </p>

          <div className="repair-guide-sourcing-list">
            {sections.sourcing.map((item, index) => (
              <div key={index} className="repair-guide-sourcing-item">
                {/* Component name + price badge */}
                <div className="repair-guide-sourcing-top">
                  <span className="repair-guide-sourcing-name">{item.name}</span>
                  <span className="repair-guide-sourcing-price">
                    {formatZar(item.priceZar)}
                  </span>
                </div>

                {/* Compatibility note */}
                {item.compatibilityNote && (
                  <p className="repair-guide-sourcing-compat">
                    <span className="repair-guide-sourcing-compat-label">✔ Compatible: </span>
                    {item.compatibilityNote}
                  </p>
                )}

                {/* Retailer link */}
                {item.retailerUrl ? (
                  <a
                    href={item.retailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repair-guide-sourcing-link"
                  >
                    🔗 Buy from {item.retailerName || 'retailer'}
                  </a>
                ) : (
                  item.retailerName && (
                    <span className="repair-guide-sourcing-link repair-guide-sourcing-link--nourl">
                      🏪 {item.retailerName}
                    </span>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

const TechnicianDashboard = () => {
  const [repairRecords, setRepairRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatingGuideId, setGeneratingGuideId] = useState(null);
  const [searchRepairNumber, setSearchRepairNumber] = useState('');

  const normalizedQuery = searchRepairNumber.trim().toUpperCase();
  const filteredRecords = repairRecords.filter((record) => {
    if (!normalizedQuery) return true;
    const repairNumber = (record.repairNumber || '').toUpperCase();
    const fallbackId = String(record._id || '').toUpperCase();
    return repairNumber.includes(normalizedQuery) || fallbackId.includes(normalizedQuery);
  });

  useEffect(() => {
    fetchRepairRecords();
  }, []);

  const fetchRepairRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = sessionStorage.getItem('technicianToken');

      const response = await fetch(`${apiUrl}/api/repair_records`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        sessionStorage.removeItem('technicianToken');
        window.location.reload();
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch repair records');
      const data = await response.json();
      setRepairRecords(data);
    } catch (error) {
      console.error('Error fetching repair records:', error);
      setError('Failed to load repair records. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateGuide = async (recordId) => {
    setGeneratingGuideId(recordId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = sessionStorage.getItem('technicianToken');

      const response = await fetch(`${apiUrl}/generate_guide_for_record/${recordId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        sessionStorage.removeItem('technicianToken');
        window.location.reload();
        return;
      }

      if (!response.ok) throw new Error('Failed to generate repair guide');
      await fetchRepairRecords();
    } catch (error) {
      console.error('Error generating guide:', error);
      setError('Failed to generate repair guide. Please try again.');
    } finally {
      setGeneratingGuideId(null);
    }
  };

  const handleViewGuide = (repairGuide) => {
    setSelectedGuide(repairGuide);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedGuide(null);
  };

  if (loading) {
    return (
      <div className="tech-dashboard-loading">
        <p>Loading repair records...</p>
      </div>
    );
  }

  return (
    <div className="tech-dashboard-container">
      {/* Ambient background orbs */}
      <div className="tech-dashboard-orb tech-dashboard-orb-1"></div>
      <div className="tech-dashboard-orb tech-dashboard-orb-2"></div>

      {/* Grid lines */}
      <div className="tech-dashboard-grid"></div>

      <div className="tech-dashboard-header">
        <h1 className="tech-dashboard-title">Technician Dashboard</h1>
        <p className="tech-dashboard-subtitle">Manage and generate AI-powered repair guides</p>
      </div>

      <div className="tech-dashboard-search">
        <input
          type="text"
          className="tech-dashboard-search-input"
          placeholder="Search by Repair Number (e.g. TOR-260322-K9M4)"
          value={searchRepairNumber}
          onChange={(e) => setSearchRepairNumber(e.target.value)}
        />
      </div>

      {error && (
        <div className="tech-dashboard-error">
          <p>{error}</p>
        </div>
      )}

      {filteredRecords.length === 0 && !loading && (
        <div className="tech-dashboard-empty">
          <p>No repair records found</p>
          <span>Try adjusting your search or check if records exist.</span>
        </div>
      )}

      {/* Records List */}
      <div>
        {filteredRecords.map((record) => (
          <div key={record._id} className="tech-dashboard-card">
            <div className="tech-dashboard-card-header">
              <h2 className="tech-dashboard-card-title">
                {record.deviceBrand} {record.deviceModel}
              </h2>
              <span className="tech-dashboard-repair-number">
                {record.repairNumber || record._id}
              </span>
            </div>

            <div className="tech-dashboard-card-content">
              <p><strong>Issue:</strong> {record.deviceIssue}</p>
              {record.additionalInfo && (
                <p><em>Additional info: {record.additionalInfo}</em></p>
              )}

              {(record.deviceModelNumber || record.serialNumber) && (
                <div className="tech-dashboard-card-meta">
                  {record.deviceModelNumber && (
                    <span className="tech-dashboard-card-meta-item">
                      📋 Model #: {record.deviceModelNumber}
                    </span>
                  )}
                  {record.serialNumber && (
                    <span className="tech-dashboard-card-meta-item">
                      🔢 Serial #: {record.serialNumber}
                    </span>
                  )}
                </div>
              )}

              {(record.operatingSystem || record.ram || record.storage || record.processor || record.graphicsCard) && (
                <div className="tech-dashboard-card-meta">
                  {record.operatingSystem && (
                    <span className="tech-dashboard-card-meta-item">
                      💻 OS: {record.operatingSystem}
                    </span>
                  )}
                  {record.ram && (
                    <span className="tech-dashboard-card-meta-item">
                      🧠 RAM: {record.ram}
                    </span>
                  )}
                  {record.storage && (
                    <span className="tech-dashboard-card-meta-item">
                      💾 Storage: {record.storage}
                    </span>
                  )}
                  {record.processor && (
                    <span className="tech-dashboard-card-meta-item">
                      ⚡ CPU: {record.processor}
                    </span>
                  )}
                  {record.graphicsCard && (
                    <span className="tech-dashboard-card-meta-item">
                      🎮 GPU: {record.graphicsCard}
                    </span>
                  )}
                </div>
              )}

              <div className="tech-dashboard-card-meta">
                <span className="tech-dashboard-card-meta-item">
                  📅 {new Date(record.timestamp).toLocaleDateString()}
                </span>
                <span className="tech-dashboard-card-meta-item">
                  {record.repair_guide ? (
                    <>✅ Guide Generated: {new Date(record.guide_generated_at).toLocaleString()}</>
                  ) : (
                    <>⏳ No guide generated yet</>
                  )}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                {!record.repair_guide ? (
                  <button
                    className="tech-dashboard-btn tech-dashboard-btn-primary"
                    onClick={() => generateGuide(record._id)}
                    disabled={generatingGuideId === record._id}
                  >
                    {generatingGuideId === record._id ? 'Generating...' : 'Generate Guide'}
                  </button>
                ) : (
                  <button
                    className="tech-dashboard-btn tech-dashboard-btn-secondary"
                    onClick={() => handleViewGuide(record.repair_guide)}
                  >
                    View Guide
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog for displaying formatted repair guide */}
      {dialogOpen && (
        <div className="tech-dashboard-dialog-overlay" onClick={handleCloseDialog}>
          <div className="tech-dashboard-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="tech-dashboard-dialog-header">
              <h2 className="tech-dashboard-dialog-title">Repair Guide</h2>
              <button
                className="tech-dashboard-dialog-close"
                onClick={handleCloseDialog}
              >
                ✕
              </button>
            </div>
            <div className="tech-dashboard-dialog-content">
              <RepairGuideFormatter repairGuide={selectedGuide} />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* ── Dialog shell ──────────────────────────────────────────────── */
        .tech-dashboard-dialog-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(5,8,15,0.8);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .tech-dashboard-dialog {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .tech-dashboard-dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .tech-dashboard-dialog-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #f0f4ff;
          margin: 0;
        }

        .tech-dashboard-dialog-close {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .tech-dashboard-dialog-close:hover {
          background: rgba(255,255,255,0.1);
          color: #f0f4ff;
        }

        .tech-dashboard-dialog-content {
          padding: 24px;
        }

        /* ── Sourcing card styles ──────────────────────────────────────── */
        :global(.repair-guide-card--sourcing) {
          border-color: rgba(34, 197, 94, 0.25) !important;
          background: rgba(34, 197, 94, 0.04) !important;
        }

        :global(.repair-guide-sourcing-subtitle) {
          font-size: 0.82rem;
          color: #94a3b8;
          margin: 0 0 16px;
        }

        :global(.repair-guide-sourcing-list) {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        :global(.repair-guide-sourcing-item) {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        :global(.repair-guide-sourcing-item:hover) {
          border-color: rgba(34, 197, 94, 0.35);
          background: rgba(34, 197, 94, 0.06);
        }

        :global(.repair-guide-sourcing-top) {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        :global(.repair-guide-sourcing-name) {
          font-size: 0.95rem;
          font-weight: 600;
          color: #e2e8f0;
          flex: 1;
        }

        :global(.repair-guide-sourcing-price) {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: #fff;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }

        :global(.repair-guide-sourcing-compat) {
          font-size: 0.82rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.5;
        }

        :global(.repair-guide-sourcing-compat-label) {
          color: #4ade80;
          font-weight: 600;
        }

        :global(.repair-guide-sourcing-link) {
          display: inline-block;
          font-size: 0.82rem;
          font-weight: 600;
          color: #60a5fa;
          text-decoration: none;
          border: 1px solid rgba(96, 165, 250, 0.3);
          border-radius: 8px;
          padding: 5px 12px;
          width: fit-content;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        :global(.repair-guide-sourcing-link:hover) {
          background: rgba(96, 165, 250, 0.12);
          border-color: rgba(96, 165, 250, 0.6);
          color: #93c5fd;
        }

        :global(.repair-guide-sourcing-link--nourl) {
          color: #94a3b8;
          border-color: rgba(148, 163, 184, 0.3);
          cursor: default;
        }

        :global(.repair-guide-alert) {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.9rem;
        }

        :global(.repair-guide-alert-info) {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #93c5fd;
        }

        :global(.repair-guide-alert-error) {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }
      `}</style>
    </div>
  );
};

export default TechnicianDashboard;