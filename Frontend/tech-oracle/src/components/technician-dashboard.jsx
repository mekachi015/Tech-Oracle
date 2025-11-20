"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { set } from 'zod';

// RepairGuideFormatter Component (extracted from the artifact above)
const RepairGuideFormatter = ({ repairGuide }) => {
  console.log('Repair Guide:', repairGuide);
  // Parse the repair guide text into structured sections

  // const parseRepairGuide = (guide) => {
  //   if (!guide) {
  //     console.warn('Guide is empty or null');
  //     return null;
  //   }

  //   const sections = {
  //     complexity: '',
  //     tools: [],
  //     stepByStep: [],
  //     testing: []
  //   };

  //   // Extract Complexity
  //   const complexityMatch = guide.match(/\*\*Complexity Level:\*\* (.+?)(?=\n|$)/);
  //   if (complexityMatch) {
  //     sections.complexity = complexityMatch[1].trim();
  //   }

  //   // Extract Tools
  //   const toolsMatch = guide.match(/\*\*Required Tools and Components:\*\*\n\n([\s\S]*?)(?=\n\n\*\*Step-by-Step)/);
  //   if (toolsMatch) {
  //     sections.tools = toolsMatch[1]
  //       .split('\n')
  //       .map(item => item.replace(/^\* /, '').trim())
  //       .filter(Boolean);
  //   }

  //   // Extract Steps
  //   const stepsMatch = guide.match(/\*\*Step-by-Step Guide to Fixing the Issue:\*\*\n\n([\s\S]*?)(?=\n\n\*\*Step-by-Step Guide to Testing)/);
  //   if (stepsMatch) {
  //     sections.stepByStep = stepsMatch[1]
  //       .split('\n')
  //       .map(item => item.replace(/^\d+\. /, '').trim())
  //       .filter(Boolean);
  //   }

  //   // Extract Testing
  //   const testingMatch = guide.match(/\*\*Step-by-Step Guide to Testing:\*\*\n\n([\s\S]*?)(?=\n\n\*\*Additional|$)/);
  //   if (testingMatch) {
  //     sections.testing = testingMatch[1]
  //       .split('\n')
  //       .map(item => item.replace(/^\d+\. /, '').trim())
  //       .filter(Boolean);
  //   }

  //   console.log('Parsed sections:', sections);
  //   return sections;
  // };

  const parseRepairGuide = (guide) => {
    if (!guide) return null;

    const extractBetween = (text, startTag, endTag) => {
      const regex = new RegExp(`\\${startTag}([\\s\\S]*?)\\${endTag}`, "m");
      const match = text.match(regex);
      return match ? match[1].trim() : "";
    };

    const complexityRaw = extractBetween(guide, "[COMPLEXITY_START]", "[COMPLEXITY_END]");
    const toolsRaw = extractBetween(guide, "[TOOLS_START]", "[TOOLS_END]");
    const stepsRaw = extractBetween(guide, "[STEPS_START]", "[STEPS_END]");
    const testingRaw = extractBetween(guide, "[TESTING_START]", "[TESTING_END]");

    return {
      complexity: complexityRaw || "N/A",
      tools: toolsRaw ? toolsRaw.split(",").map(t => t.trim()).filter(Boolean) : [],
      stepByStep: stepsRaw ? stepsRaw.split(",").map(s => s.trim()).filter(Boolean) : [],
      testing: testingRaw ? testingRaw.split(",").map(t => t.trim()).filter(Boolean) : []
    };
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
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333'
  };

  const chipStyle = (color, text) => ({
    display: 'inline-block',
    backgroundColor: color,
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold'
  });

  const stepStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
    padding: '8px 0'
  };

  const stepNumberStyle = {
    backgroundColor: '#2196f3',
    color: 'white',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    flexShrink: 0
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Complexity Level */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span>{getComplexityIcon(sections.complexity)}</span>
          <span>Complexity Level</span>
        </div>
        <div style={chipStyle(getComplexityColor(sections.complexity), sections.complexity)}>
          {sections.complexity}
        </div>
      </div>

      {/* Required Tools */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span>🔧</span>
          <span>Required Tools & Components</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {sections.tools.map((tool, index) => (
            <li key={index} style={{ marginBottom: '8px', lineHeight: '1.5' }}>
              {tool}
            </li>
          ))}
        </ul>
      </div>

      {/* Step by Step Guide */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span>📋</span>
          <span>Step-by-Step Repair Guide</span>
        </div>
        <div>
          {sections.stepByStep.map((step, index) => (
            <div key={index} style={stepStyle}>
              <div style={stepNumberStyle}>
                {index + 1}
              </div>
              <div style={{ flex: 1, lineHeight: '1.5', fontSize: '14px' }}>
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testing Guide */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span>✅</span>
          <span>Testing Guide</span>
        </div>
        <div>
          {sections.testing.map((test, index) => (
            <div key={index} style={stepStyle}>
              <div style={{
                ...stepNumberStyle,
                backgroundColor: '#4caf50'
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1, lineHeight: '1.5', fontSize: '14px' }}>
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
  const [mounted, setMounted] = useState(false);

  const [generatingGuideId, setGeneratingGuide] = useState(null);

  useEffect(() => {
    setMounted(true);
    fetchRepairRecords();
  }, []);

  const fetchRepairRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/repair_records');
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
    setGeneratingGuide(recordId);
    try {
      const response = await fetch(`http://localhost:8000/generate_guide_for_record/${recordId}`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to generate repair guide');
      }
      // Refresh the records to show the new guide
      await fetchRepairRecords();
    } catch (error) {
      console.error('Error generating guide:', error);
      setError('Failed to generate repair guide. Please try again.');
    } finally {
      setGeneratingGuide(null);
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

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Technician Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Brand & Model</TableCell>
              <TableCell>Issue</TableCell>
              <TableCell>Specifications</TableCell>
              <TableCell>Repair Guide Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {repairRecords.map((record) => (
              <TableRow key={record._id}>
                <TableCell>
                  {record.timestamp
                    ? new Date(record.timestamp).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    Brand: {record.deviceBrand}
                    <br />
                    Model: {record.deviceModel}
                    <br />
                    {record.deviceModelNumber &&
                      `Model #: ${record.deviceModelNumber}`}
                    <br />
                    {record.serialNumber && `Serial #: ${record.serialNumber}`}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {record.deviceIssue}
                    {record.additionalInfo && (
                      <>
                        <br />
                        <em>Additional info: {record.additionalInfo}</em>
                      </>
                    )}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {record.operatingSystem && `OS: ${record.operatingSystem}`}
                    <br />
                    {record.ram && `RAM: ${record.ram}`}
                    <br />
                    {record.storage && `Storage: ${record.storage}`}
                    <br />
                    {record.processor && `CPU: ${record.processor}`}
                    <br />
                    {record.graphicsCard && `GPU: ${record.graphicsCard}`}
                  </Typography>
                </TableCell>
                <TableCell>
                  {record.repair_guide ? (
                    <Typography variant="body2" color="success.main">
                      ✅ Guide Generated
                      <br />
                      <small>
                        {record.guide_generated_at ? new Date(record.guide_generated_at).toLocaleString() : 'N/A'}
                      </small>
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {generatingGuideId === record._id ? (
                        <span>
                          <span className="spinning">⏳</span> Generating
                          guide...
                        </span>
                      ) : (
                        <span>⏳ No guide generated yet</span>
                      )}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{ display: "flex", gap: 1, flexDirection: "column" }}
                  >
                    {!record.repair_guide ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => generateGuide(record._id)}
                        disabled={generatingGuideId === record._id}
                      >
                        {generatingGuideId === record._id
                          ? "Generating..."
                          : "Generate Guide"}
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewGuide(record.repair_guide)}
                      >
                        View Guide
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for displaying formatted repair guide */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: "80vh" },
        }}
      >
        <DialogTitle>
          <Typography component="div" variant="h5">
            Repair Guide
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <RepairGuideFormatter repairGuide={selectedGuide} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechnicianDashboard;