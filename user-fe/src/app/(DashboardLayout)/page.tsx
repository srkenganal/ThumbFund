'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import TaskPerformance from '@/app/(DashboardLayout)/components/dashboard/ProductPerformance';

const Dashboard = () => {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={3}>

          <Grid item xs={12} lg={12}>
            {/* <ProductPerformance /> */}
            <TaskPerformance />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default Dashboard;
