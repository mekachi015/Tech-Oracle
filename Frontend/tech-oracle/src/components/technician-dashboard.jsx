"use client"
import React, { useState, useEffect } from 'react';
import './technician-dashboard.css';

// RepairGuideFormatter Component (extracted from the artifact above)
const RepairGuideFormatter = ({ repairGuide }) => {
  console.log('Repair Guide:', repairGuide);
  // Parse the repair guide text into structured sections
  const parseRepairGuide = (guide) => {
  if (!guide) {
    console.warn('Guide is empty or null');
    return null;
  }

  const sections = {
    complexity: '',
    tools: [],
    stepByStep: [],
    testing: []
  };

  // Extract Complexity using delimiter format
  const complexityMatch = guide.match(/\*\*COMPLEXITY_START\*\*\s*([\s\S]*?)\s*\*\*COMPLEXITY_END\*\*/);
  if (complexityMatch) {
    const complexityValue = complexityMatch[1].trim();
    // Extract just the number if there's extra text
    const numMatch = complexityValue.match(/(\d+)/);
    if (numMatch) {
      sections.complexity = `${numMatch[1]}/10`;
    } else {
      sections.complexity = complexityValue;
    }
  } else {
    console.warn('Failed to match complexity section');
  }

  // Extract Tools using delimiter format
  const toolsMatch = guide.match(/\*\*TOOLS_START\*\*\s*([\s\S]*?)\s*\*\*TOOLS_END\*\*/);
  if (toolsMatch) {
    const toolsText = toolsMatch[1].trim();
    // Split by newlines instead of commas for better parsing
    sections.tools = toolsText
      .split('\n')
      .map(item => item.replace(/^[-•*]\s*/, '').trim()) // Remove bullet points
      .filter(item => item !== '' && item.length > 2);
  } else {
    console.warn('Failed to match tools section');
  }

  // Extract Steps using delimiter format
  const stepsMatch = guide.match(/\*\*STEPS_START\*\*\s*([\s\S]*?)\s*\*\*STEPS_END\*\*/);
  if (stepsMatch) {
    const stepsText = stepsMatch[1].trim();
    sections.stepByStep = stepsText
      .split('\n')
      .map(item => item.replace(/^(\d+\.|\d+\)|-|•|\\*)\s*/, '').trim()) // Remove numbered lists, bullets
      .filter(item => item !== '' && item.length > 3);
  } else {
    console.warn('Failed to match steps section');
  }

  // Extract Testing using delimiter format
  const testingMatch = guide.match(/\*\*TESTING_START\*\*\s*([\s\S]*?)\s*\*\*TESTING_END\*\*/);
  if (testingMatch) {
    const testingText = testingMatch[1].trim();
    sections.testing = testingText
      .split('\n')
      .map(item => item.replace(/^(Test\s*\d+:?|\d+\.|\d+\)|-|•|\\*)\s*/i, '').trim()) // Remove test labels, numbers, bullets
      .filter(item => item !== '' && item.length > 3);
  } else {
    console.warn('Failed to match testing section');
  }

  console.log('Final parsed sections:', sections);
  return sections;
};

  const getComplexityColor = (complexity) => {
    const level = parseInt(complexity.match(/(\d+)/)?.[1] || '0');
    if (level <= 3) return '#4caf50'; // green
    if (level <= 6) return '#ff9800'; // orange
    return '#f44336'; // red
  };

  const getComplexityIcon = (complexity) => {
    const level = parseInt(complexity.match(/(\d+)/)?.[1] || '0');
    if (level <= 6) return '✅';
    return '⚠️';
  };

  if (!repairGuide) {
    return (
      <Alert severity="info">
        ℹ️ No repair guide generated yet
      </Alert>
    );
  }

  const sections = parseRepairGuide(repairGuide);
  
  if (!sections) {
    return (
      <Alert severity="error">
        ❌ Unable to parse repair guide
      </Alert>
    );
  }

  const cardStyle = {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    transition: 'transform 0.25s ease, border-color 0.25s ease, background 0.25s ease'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#f0f4ff'
  };

  const chipStyle = (color, text) => ({
    display: 'inline-block',
    backgroundColor: color,
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600'
  });

  const stepStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
    padding: '8px 0'
  };

  const stepNumberStyle = {
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    color: 'white',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '600',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
  };

  return (
    <div className="repair-guide-container">
      {/* Complexity Level */}
      <div className="repair-guide-card">
        <div className="repair-guide-header">
          <span>{getComplexityIcon(sections.complexity)}</span>
          <span>Complexity Level</span>
        </div>
        <div className="repair-guide-complexity">
          {sections.complexity}
        </div>
      </div>

      {/* Required Tools */}
      <div className="repair-guide-card">
        <div className="repair-guide-header">
          <span>🔧</span>
          <span>Required Tools & Components</span>
        </div>
        <ul className="repair-guide-list">
          {sections.tools.map((tool, index) => (
            <li key={index}>
              {tool}
            </li>
          ))}
        </ul>
      </div>

      {/* Step by Step Guide */}
      <div className="repair-guide-card">
        <div className="repair-guide-header">
          <span>📋</span>
          <span>Step-by-Step Repair Guide</span>
        </div>
        <div>
          {sections.stepByStep.map((step, index) => (
            <div key={index} className="repair-guide-step">
              <div className="repair-guide-step-number">
                {index + 1}
              </div>
              <div className="repair-guide-step-content">
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testing Guide */}
      <div className="repair-guide-card">
        <div className="repair-guide-header">
          <span>✅</span>
          <span>Testing Guide</span>
        </div>
        <div>
          {sections.testing.map((test, index) => (
            <div key={index} className="repair-guide-step">
              <div className="repair-guide-test-number">
                {index + 1}
              </div>
              <div className="repair-guide-step-content">
                {test}
              </div>
            </div>
          ))}
        </div>
      </div>
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
    if (!normalizedQuery) {
      return true;
    }
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
        // Token expired or invalid - redirect to login
        sessionStorage.removeItem('technicianToken');
        window.location.reload();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch repair records');
      }
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
        // Token expired or invalid - redirect to login
        sessionStorage.removeItem('technicianToken');
        window.location.reload();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to generate repair guide');
      }
      // Refresh the records to show the new guide
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
        .tech-dashboard-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
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
      `}</style>
    </div>
  );
};

export default TechnicianDashboard;