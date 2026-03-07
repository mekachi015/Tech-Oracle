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
  const complexityMatch = guide.match(/\*\*COMPLEXITY_START\*\*\s*(.*?)\s*\*\*COMPLEXITY_END\*\*/s);
  if (complexityMatch) {
    sections.complexity = `${complexityMatch[1].trim()}/10`;
  } else {
    console.warn('Failed to match complexity section');
  }

  // Extract Tools using delimiter format
  const toolsMatch = guide.match(/\*\*TOOLS_START\*\*\s*([\s\S]*?)\s*\*\*TOOLS_END\*\*/);
  if (toolsMatch) {
    const toolsText = toolsMatch[1].trim();
    sections.tools = toolsText
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
  } else {
    console.warn('Failed to match tools section');
  }

  // Extract Steps using delimiter format
  const stepsMatch = guide.match(/\*\*STEPS_START\*\*\s*([\s\S]*?)\s*\*\*STEPS_END\*\*/);
  if (stepsMatch) {
    const stepsText = stepsMatch[1].trim();
    sections.stepByStep = stepsText
      .split('\n')
      .map(item => item.replace(/^\d+\.\s*/, '').trim())
      .filter(item => item !== '' && !item.startsWith('Identify the problem'));
  } else {
    console.warn('Failed to match steps section');
  }

  // Extract Testing using delimiter format
  const testingMatch = guide.match(/\*\*TESTING_START\*\*\s*([\s\S]*?)\s*\*\*TESTING_END\*\*/);
  if (testingMatch) {
    const testingText = testingMatch[1].trim();
    sections.testing = testingText
      .split('\n')
      .map(item => item.replace(/^Test\s*\d+:\s*/i, '').trim())
      .filter(item => item !== '');
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
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  };

  const chipStyle = (color, text) => ({
    display: 'inline-block',
    backgroundColor: color,
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold'
  });

  const stepStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '10px',
    padding: '6px 0'
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
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
          {sections.tools.map((tool, index) => (
            <li key={index} style={{ marginBottom: '6px', lineHeight: '1.6', wordBreak: 'break-word' }}>
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
              <div style={{ flex: 1, lineHeight: '1.6', fontSize: '13px', wordBreak: 'break-word' }}>
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
              <div style={{ flex: 1, lineHeight: '1.6', fontSize: '13px', wordBreak: 'break-word' }}>
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

  useEffect(() => {
    fetchRepairRecords();
  }, []);

  const fetchRepairRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/repair_records`);
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
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/generate_guide_for_record/${recordId}`, {
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
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
        Technician Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {repairRecords.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No repair records found. Waiting for customer submissions.
        </Alert>
      )}

      {/* Desktop Table View */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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
                    {new Date(record.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Brand: {record.deviceBrand}<br/>
                      Model: {record.deviceModel}<br/>
                      {record.deviceModelNumber && `Model #: ${record.deviceModelNumber}`}<br/>
                      {record.serialNumber && `Serial #: ${record.serialNumber}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {record.deviceIssue}
                      {record.additionalInfo && (
                        <><br/><em>Additional info: {record.additionalInfo}</em></>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {record.operatingSystem && `OS: ${record.operatingSystem}`}<br/>
                      {record.ram && `RAM: ${record.ram}`}<br/>
                      {record.storage && `Storage: ${record.storage}`}<br/>
                      {record.processor && `CPU: ${record.processor}`}<br/>
                      {record.graphicsCard && `GPU: ${record.graphicsCard}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {record.repair_guide ? (
                      <Typography variant="body2" color="success.main">
                        ✅ Guide Generated
                        <br/>
                        <small>
                          {new Date(record.guide_generated_at).toLocaleString()}
                        </small>
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        ⏳ No guide generated yet
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                      {!record.repair_guide ? (
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => generateGuide(record._id)}
                        >
                          Generate Guide
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
      </Box>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {repairRecords.map((record) => (
          <Card key={record._id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {new Date(record.timestamp).toLocaleDateString()}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {record.deviceBrand} {record.deviceModel}
              </Typography>
              
              {record.deviceModelNumber && (
                <Typography variant="body2" color="text.secondary">
                  Model #: {record.deviceModelNumber}
                </Typography>
              )}
              
              {record.serialNumber && (
                <Typography variant="body2" color="text.secondary">
                  Serial #: {record.serialNumber}
                </Typography>
              )}
              
              <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Issue:
                </Typography>
                <Typography variant="body2">
                  {record.deviceIssue}
                </Typography>
                {record.additionalInfo && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    Additional info: {record.additionalInfo}
                  </Typography>
                )}
              </Box>
              
              {(record.operatingSystem || record.ram || record.storage || record.processor || record.graphicsCard) && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Specifications:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {record.operatingSystem && `OS: ${record.operatingSystem}`}<br/>
                    {record.ram && `RAM: ${record.ram}`}<br/>
                    {record.storage && `Storage: ${record.storage}`}<br/>
                    {record.processor && `CPU: ${record.processor}`}<br/>
                    {record.graphicsCard && `GPU: ${record.graphicsCard}`}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mb: 2 }}>
                {record.repair_guide ? (
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                    ✅ Guide Generated
                    <br/>
                    <Typography variant="caption" component="span">
                      {new Date(record.guide_generated_at).toLocaleString()}
                    </Typography>
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    ⏳ No guide generated yet
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                {!record.repair_guide ? (
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => generateGuide(record._id)}
                  >
                    Generate Guide
                  </Button>
                ) : (
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => handleViewGuide(record.repair_guide)}
                  >
                    View Guide
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Dialog for displaying formatted repair guide */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={false}
        PaperProps={{
          sx: { 
            maxHeight: '90vh',
            m: { xs: 1, sm: 2 },
            maxWidth: { xs: 'calc(100% - 16px)', sm: '600px' }
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography component="div" variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Repair Guide
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <RepairGuideFormatter repairGuide={selectedGuide} />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Button onClick={handleCloseDialog} color="primary" fullWidth={false}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechnicianDashboard;