import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Code, Visibility, VisibilityOff, Search, CheckCircle } from '@mui/icons-material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import axiosInstance from '../../axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const ResultPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedResult, setSelectedResult] = useState(null);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('all');
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching data for user:', userInfo?.role);
        
        // Fetch all exams first
        const examsResponse = await axiosInstance.get('/api/users/exam', {
          withCredentials: true,
        });
        console.log('Exams fetched:', examsResponse.data);
        setExams(examsResponse.data);

        // Fetch results based on user role
        if (userInfo?.role === 'teacher') {
          // For teachers, fetch all results
          console.log('Fetching all results for teacher...');
          const resultsResponse = await axiosInstance.get('/api/users/results/all', {
            withCredentials: true,
          });
          console.log('All results fetched:', resultsResponse.data);
          setResults(resultsResponse.data.data || []);
        } else {
          // For students, fetch only their visible results
          console.log('Fetching user results for student...');
          const resultsResponse = await axiosInstance.get('/api/users/results/user', {
            withCredentials: true,
          });
          console.log('User results fetched:', resultsResponse.data);
          setResults(resultsResponse.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo) {
      fetchData();
    }
  }, [userInfo]);

  const handleToggleVisibility = async (resultId) => {
    try {
      console.log('Toggling visibility for result:', resultId);
      
      const response = await axiosInstance.put(
        `/api/users/results/${resultId}/toggle-visibility`,
        {},
        {
          withCredentials: true,
        },
      );
      
      console.log('Toggle response:', response.data);
      toast.success(response.data.data?.message || 'Visibility updated successfully');
      
      // Refresh results
      const resultsResponse = await axiosInstance.get('/api/users/results/all', {
        withCredentials: true,
      });
      setResults(resultsResponse.data.data || []);
    } catch (err) {
      console.error('Error toggling visibility:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update visibility';
      toast.error(errorMessage);
    }
  };

  const handleViewCode = (result) => {
    setSelectedResult(result);
    setCodeDialogOpen(true);
  };

  const handleExamChange = async (examId) => {
    setSelectedExam(examId);
    try {
      setLoading(true);
      if (examId === 'all') {
        // Fetch all results again
        const response = await axiosInstance.get('/api/users/results/all', {
          withCredentials: true,
        });
        setResults(response.data.data || []);
      } else {
        // Fetch results for specific exam
        const response = await axiosInstance.get(`/api/users/results/exam/${examId}`, {
          withCredentials: true,
        });
        setResults(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching exam results:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch exam results';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = selectedExam === 'all' || result.examId === selectedExam;
    return matchesSearch && matchesExam;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading results...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error" description="Error loading results">
        <Box p={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Box>
      </PageContainer>
    );
  }

  // Student View
  if (userInfo?.role === 'student') {
    return (
      <PageContainer title="My Exam Results" description="View your exam results">
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Exams Taken
                </Typography>
                <Typography variant="h3">
                  {results.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Average Score
                </Typography>
                <Typography variant="h3">
                  {results.length > 0
                    ? `${(
                        results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / results.length
                      ).toFixed(1)}%`
                    : '0%'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Coding Submissions
                </Typography>
                <Typography variant="h3">
                  {results.reduce((acc, curr) => acc + (curr.codingSubmissions?.length || 0), 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Results Table */}
          <Grid item xs={12}>
            <DashboardCard title="My Results">
              {results.length === 0 ? (
                <Alert severity="info">
                  No results available yet. Your results will appear here once they are published by your teacher.
                </Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Exam</TableCell>
                        <TableCell>MCQ Score</TableCell>
                        <TableCell>Coding Submissions</TableCell>
                        <TableCell>Total Marks</TableCell>
                        <TableCell>Submission Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result._id}>
                          <TableCell>
                            <Typography variant="body1" fontWeight="medium">
                              {result.examName || result.examId || 'Unknown Exam'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${(result.percentage || 0).toFixed(1)}%`}
                              color={(result.percentage || 0) >= 70 ? 'success' : (result.percentage || 0) >= 50 ? 'warning' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">
                                {result.codingSubmissions?.length || 0} submissions
                              </Typography>
                              {(result.codingSubmissions?.length || 0) > 0 && (
                                <CheckCircle color="success" fontSize="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" fontWeight="medium">
                              {result.totalMarks || 0} marks
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {(result.codingSubmissions?.length || 0) > 0 && (
                              <IconButton 
                                onClick={() => handleViewCode(result)}
                                color="primary"
                              >
                                <Code />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DashboardCard>
          </Grid>
        </Grid>

        {/* Code View Dialog */}
        <Dialog
          open={codeDialogOpen}
          onClose={() => setCodeDialogOpen(false)}
          maxWidth="md"
          fullWidth
          scroll="paper"
        >
          <DialogTitle>
            My Code Submissions - {selectedResult?.examName || selectedResult?.examId}
          </DialogTitle>
          <DialogContent>
            {selectedResult?.codingSubmissions?.length > 0 ? (
              selectedResult.codingSubmissions.map((submission, index) => (
                <Box key={index} mb={3} p={2} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Question {index + 1}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {submission.question}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Language: {submission.language}
                  </Typography>
                  <Box mt={1} mb={2}>
                    <SyntaxHighlighter 
                      language={submission.language?.toLowerCase() || 'javascript'} 
                      style={docco}
                      showLineNumbers
                    >
                      {submission.code || '// No code submitted'}
                    </SyntaxHighlighter>
                  </Box>
                  <Box display="flex" gap={1} alignItems="center">
                    <Chip 
                      icon={<CheckCircle />} 
                      label={submission.status || 'Submitted'} 
                      color={submission.status === 'success' ? 'success' : 'default'} 
                    />
                    {submission.executionTime && (
                      <Chip 
                        label={`Execution Time: ${submission.executionTime}ms`} 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary">
                No code submissions available.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCodeDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </PageContainer>
    );
  }

  // Teacher View
  return (
    <PageContainer title="Results Dashboard" description="View and manage exam results">
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h3">
                {filteredResults.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Score
              </Typography>
              <Typography variant="h3">
                {filteredResults.length > 0
                  ? `${(
                      filteredResults.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
                      filteredResults.length
                    ).toFixed(1)}%`
                  : '0%'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Coding Submissions
              </Typography>
              <Typography variant="h3">
                {filteredResults.reduce(
                  (acc, curr) => acc + (curr.codingSubmissions?.length || 0),
                  0,
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Table */}
        <Grid item xs={12}>
          <DashboardCard title="Exam Results">
            {/* Exam Filter and Search */}
            <Box mb={3} display="flex" gap={2} flexWrap="wrap">
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Exam</InputLabel>
                <Select
                  value={selectedExam}
                  onChange={(e) => handleExamChange(e.target.value)}
                  label="Select Exam"
                >
                  <MenuItem value="all">All Exams</MenuItem>
                  {exams.map((exam) => (
                    <MenuItem key={exam._id} value={exam._id}>
                      {exam.examName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Search Students"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => setSelectedTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="All Results" />
              <Tab label="MCQ Results" />
              <Tab label="Coding Results" />
            </Tabs>

            {filteredResults.length === 0 ? (
              <Alert severity="info">
                No results found for the selected criteria.
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Exam</TableCell>
                      <TableCell>MCQ Score</TableCell>
                      <TableCell>Coding Submissions</TableCell>
                      <TableCell>Total Marks</TableCell>
                      <TableCell>Submission Date</TableCell>
                      <TableCell>Visibility</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result._id}>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            {result.userId?.name || 'Unknown Student'}
                          </Typography>
                        </TableCell>
                        <TableCell>{result.userId?.email || 'N/A'}</TableCell>
                        <TableCell>
                          {result.examName || exams.find((e) => e._id === result.examId)?.examName || result.examId}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${(result.percentage || 0).toFixed(1)}%`}
                            color={(result.percentage || 0) >= 70 ? 'success' : (result.percentage || 0) >= 50 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">
                              {result.codingSubmissions?.length || 0}
                            </Typography>
                            {(result.codingSubmissions?.length || 0) > 0 && (
                              <CheckCircle color="success" fontSize="small" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            {result.totalMarks || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={result.showToStudent ? 'Visible' : 'Hidden'}
                            color={result.showToStudent ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <IconButton
                              onClick={() => handleToggleVisibility(result._id)}
                              color={result.showToStudent ? 'success' : 'default'}
                              title={result.showToStudent ? 'Hide from student' : 'Show to student'}
                            >
                              {result.showToStudent ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                            {(result.codingSubmissions?.length || 0) > 0 && (
                              <IconButton 
                                onClick={() => handleViewCode(result)}
                                color="primary"
                                title="View code submissions"
                              >
                                <Code />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DashboardCard>
        </Grid>
      </Grid>

      {/* Code View Dialog */}
      <Dialog
        open={codeDialogOpen}
        onClose={() => setCodeDialogOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Code Submissions - {selectedResult?.userId?.name}
        </DialogTitle>
        <DialogContent>
          {selectedResult?.codingSubmissions?.length > 0 ? (
            selectedResult.codingSubmissions.map((submission, index) => (
              <Box key={index} mb={3} p={2} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Question {index + 1}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {submission.question}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Language: {submission.language}
                </Typography>
                <Box mt={1} mb={2}>
                  <SyntaxHighlighter 
                    language={submission.language?.toLowerCase() || 'javascript'} 
                    style={docco}
                    showLineNumbers
                  >
                    {submission.code || '// No code submitted'}
                  </SyntaxHighlighter>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  <Chip 
                    icon={<CheckCircle />} 
                    label={submission.status || 'Submitted'} 
                    color={submission.status === 'success' ? 'success' : 'default'} 
                  />
                  {submission.executionTime && (
                    <Chip 
                      label={`Execution Time: ${submission.executionTime}ms`} 
                      variant="outlined" 
                    />
                  )}
                </Box>
              </Box>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary">
              No code submissions available for this student.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCodeDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ResultPage;