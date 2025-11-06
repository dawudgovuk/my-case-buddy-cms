import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import CaseSteps from '../components/CaseSteps'
import { getStagesForCase, getCurrentStageIndex } from '../utils/caseStages'
import { format } from 'date-fns'

export default function LIPDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { cases } = useCasesStore()

  // Get cases for the current user (LIP)
  const userCases = cases.filter(c => 
    c.members?.some(m => m.userId === user?.id && m.role === 'Owner')
  )

  if (!user) {
    return <Typography>Please log in</Typography>
  }

  return (
    <Box>
      <Stack spacing={3}>
        <Typography variant="h4">My Cases Dashboard</Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, {user.name}. Here's an overview of your cases and their progress.
        </Typography>

        {userCases.length === 0 ? (
          <Card>
            <CardContent>
              <Typography>You don't have any cases yet.</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/cases/new')}>
                Create Your First Case
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {userCases.map((caseData) => {
              const stages = getStagesForCase(caseData)
              const currentIndex = getCurrentStageIndex(caseData)
              const nextHearing = caseData.hearings
                .filter(h => new Date(h.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

              return (
                <Grid item xs={12} md={6} key={caseData.id}>
                  <Card>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="h6">{caseData.id} — {caseData.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {caseData.court} • {caseData.caseType}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip size="small" label={caseData.status} />
                            <Chip size="small" label={`${caseData.hearings.length} hearings`} />
                          </Stack>
                        </Box>

                        {nextHearing && (
                          <Box sx={{ p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                            <Typography variant="caption" fontWeight="bold">
                              Next Hearing: {format(new Date(nextHearing.date), 'PPP')}
                              {nextHearing.time && ` at ${nextHearing.time}`}
                            </Typography>
                            {nextHearing.location && (
                              <Typography variant="caption" display="block">
                                Location: {nextHearing.location}
                              </Typography>
                            )}
                          </Box>
                        )}

                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Case Progress
                          </Typography>
                          <CaseSteps 
                            stages={stages} 
                            currentStageIndex={currentIndex}
                          />
                        </Box>

                        <Button 
                          variant="outlined" 
                          onClick={() => navigate(`/cases/${caseData.id}`)}
                          fullWidth
                        >
                          View Case Details
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Stack>
    </Box>
  )
}
