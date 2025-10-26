import React from 'react';
import { Typography, Box } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import CheatingTable from './components/CheatingTable';

const ExamLogPage = () => {
  return (
    <PageContainer title="Exam Cheating Logs" description="View and monitor cheating detection logs for all exams">
      <DashboardCard title="Exam Cheating Monitoring">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
            Cheating Detection Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Monitor and review cheating incidents detected during exams. Select an exam to view detailed violation logs and screenshots.
          </Typography>
        </Box>
        
        <CheatingTable />
      </DashboardCard>
    </PageContainer>
  );
};

export default ExamLogPage;