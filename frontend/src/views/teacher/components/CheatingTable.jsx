import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Alert,
} from '@mui/material';
import { useGetExamsQuery } from 'src/slices/examApiSlice';
import { useGetCheatingLogsQuery } from 'src/slices/cheatingLogApiSlice';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import WarningIcon from '@mui/icons-material/Warning';

export default function CheatingTable() {
  const [filter, setFilter] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [cheatingLogs, setCheatingLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { data: examsData, isLoading: examsLoading, error: examsError } = useGetExamsQuery();
  const {
    data: cheatingLogsData,
    isLoading: logsLoading,
    error: logsError,
    refetch,
  } = useGetCheatingLogsQuery(selectedExamId, {
    skip: !selectedExamId,
  });

  useEffect(() => {
    if (cheatingLogsData) {
      const logsArray = Array.isArray(cheatingLogsData) ? cheatingLogsData : [];
      setCheatingLogs(logsArray);
    }
  }, [cheatingLogsData]);

  useEffect(() => {
    if (examsData && examsData.length > 0 && !selectedExamId) {
      const firstExam = examsData[0];
      setSelectedExamId(firstExam.examId || firstExam._id);
    }
  }, [examsData, selectedExamId]);

  const filteredUsers = cheatingLogs.filter(
    (log) =>
      log.username?.toLowerCase().includes(filter.toLowerCase()) ||
      log.email?.toLowerCase().includes(filter.toLowerCase()),
  );

  const handleViewScreenshots = (log) => {
    setSelectedLog(log);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLog(null);
  };

  const getViolationColor = (count) => {
    const numCount = Number(count) || 0;
    if (numCount > 5) return 'error';
    if (numCount > 2) return 'warning';
    if (numCount > 0) return 'info';
    return 'default';
  };

  const getViolationIcon = (count) => {
    const numCount = Number(count) || 0;
    if (numCount > 0) return <WarningIcon />;
    return null;
  };

  const getTotalViolations = (log) => {
    const total = 
      (Number(log.noFaceCount) || 0) +
      (Number(log.multipleFaceCount) || 0) +
      (Number(log.cellPhoneCount) || 0) +
      (Number(log.prohibitedObjectCount) || 0);
    return total;
  };

  const handleRefresh = () => {
    if (selectedExamId) {
      refetch();
    }
  };

  if (examsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading exams...</Typography>
      </Box>
    );
  }

  if (examsError) {
    return (
      <Box p={2}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading exams: {examsError.data?.message || examsError.error || 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  if (!examsData || examsData.length === 0) {
    return (
      <Box p={2}>
        <Alert severity="info">
          No exams available. Please create an exam first.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Select
              value={selectedExamId || ''}
              onChange={(e) => setSelectedExamId(e.target.value)}
              fullWidth
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select an Exam
              </MenuItem>
              {examsData.map((exam) => (
                <MenuItem key={exam.examId || exam._id} value={exam.examId || exam._id}>
                  {exam.examName || exam.name || `Exam ${exam.examId || exam._id}`}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Filter by Student Name or Email"
              variant="outlined"
              fullWidth
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search students..."
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Tooltip title="Refresh logs">
              <IconButton 
                onClick={handleRefresh} 
                disabled={!selectedExamId || logsLoading}
                color="primary"
              >
                <CircularProgress size={24} sx={{ display: logsLoading ? 'block' : 'none' }} />
                <Typography sx={{ display: logsLoading ? 'none' : 'block' }}>🔄</Typography>
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      {logsLoading && selectedExamId && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading cheating logs...</Typography>
        </Box>
      )}

      {/* Error State */}
      {logsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading cheating logs: {logsError.data?.message || logsError.error || 'Unknown error'}
        </Alert>
      )}

      {/* Main Table */}
      {!logsLoading && selectedExamId && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Student Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">No Face</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Multiple Faces</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Cell Phone</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Prohibited Objects</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Total Violations</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Screenshots</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      {cheatingLogs.length === 0 
                        ? 'No cheating logs found for this exam' 
                        : 'No students match your filter'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((log, index) => (
                  <TableRow 
                    key={log._id || index} 
                    sx={{ 
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      backgroundColor: getTotalViolations(log) > 5 ? '#ffebee' : 'inherit'
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {log.username || 'Unknown User'}
                      </Typography>
                    </TableCell>
                    <TableCell>{log.email || 'No email'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getViolationIcon(log.noFaceCount)}
                        label={log.noFaceCount || 0}
                        color={getViolationColor(log.noFaceCount)}
                        size="small"
                        variant={log.noFaceCount > 0 ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getViolationIcon(log.multipleFaceCount)}
                        label={log.multipleFaceCount || 0}
                        color={getViolationColor(log.multipleFaceCount)}
                        size="small"
                        variant={log.multipleFaceCount > 0 ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getViolationIcon(log.cellPhoneCount)}
                        label={log.cellPhoneCount || 0}
                        color={getViolationColor(log.cellPhoneCount)}
                        size="small"
                        variant={log.cellPhoneCount > 0 ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getViolationIcon(log.prohibitedObjectCount)}
                        label={log.prohibitedObjectCount || 0}
                        color={getViolationColor(log.prohibitedObjectCount)}
                        size="small"
                        variant={log.prohibitedObjectCount > 0 ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getTotalViolations(log)}
                        color={getTotalViolations(log) > 5 ? 'error' : getTotalViolations(log) > 0 ? 'warning' : 'success'}
                        variant="filled"
                        size="medium"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={log.screenshots?.length ? `View ${log.screenshots.length} screenshots` : 'No screenshots'}>
                        <IconButton
                          onClick={() => handleViewScreenshots(log)}
                          disabled={!log.screenshots?.length}
                          color={log.screenshots?.length ? "primary" : "default"}
                        >
                          <ImageIcon />
                          {log.screenshots?.length > 0 && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                ml: 0.5,
                                backgroundColor: 'primary.main',
                                color: 'white',
                                borderRadius: '50%',
                                width: 16,
                                height: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.6rem'
                              }}
                            >
                              {log.screenshots.length}
                            </Typography>
                          )}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* No Exam Selected */}
      {!selectedExamId && !logsLoading && (
        <Alert severity="info">
          Please select an exam to view cheating logs.
        </Alert>
      )}

      {/* Screenshots Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Screenshots - {selectedLog?.username}
              {selectedLog?.screenshots?.length && ` (${selectedLog.screenshots.length} images)`}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedLog?.screenshots?.length ? (
            <Grid container spacing={2}>
              {selectedLog.screenshots.map((screenshot, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardMedia
                      component="img"
                      height="200"
                      image={screenshot.url}
                      alt={`Violation - ${screenshot.type}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Chip 
                        label={screenshot.type} 
                        color={
                          screenshot.type === 'cellPhone' ? 'error' : 
                          screenshot.type === 'noFace' ? 'warning' : 
                          'info'
                        }
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Detected: {new Date(screenshot.detectedAt).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No screenshots available for this student.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}