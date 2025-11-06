import { Box, Button, Card, CardContent, Checkbox, Chip, Grid, List, ListItem, ListItemText, Stack, Typography, Divider } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import { getDeadlinesForUser, updateDeadline } from '../services/storage'
import { format, isPast, isToday, differenceInDays } from 'date-fns'
import { useEffect, useState } from 'react'
import type { DocumentDeadline } from '../types/domain'

export default function ProfessionalDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { cases } = useCasesStore()
  const [deadlines, setDeadlines] = useState<DocumentDeadline[]>([])
  const [upcomingHearings, setUpcomingHearings] = useState<Array<{
    caseId: string
    caseTitle: string
    hearing: { id: string; type: string; date: string; time?: string; location?: string; judge?: string }
  }>>([])

  useEffect(() => {
    if (!user) return

    // Get deadlines assigned to this user
    const userDeadlines = getDeadlinesForUser(user.id)
    setDeadlines(userDeadlines)

    // Get cases where user is a member
    const userCases = cases.filter(c => 
      c.members?.some(m => m.userId === user.id)
    )

    // Collect upcoming hearings
    const hearings: Array<{
      caseId: string
      caseTitle: string
      hearing: { id: string; type: string; date: string; time?: string; location?: string; judge?: string }
    }> = []

    userCases.forEach(caseData => {
      caseData.hearings.forEach(hearing => {
        const hearingDate = new Date(hearing.date)
        if (hearingDate >= new Date()) {
          hearings.push({
            caseId: caseData.id,
            caseTitle: caseData.title,
            hearing: {
              id: hearing.id,
              type: hearing.type,
              date: hearing.date,
              time: hearing.time,
              location: hearing.location,
              judge: hearing.judge,
            }
          })
        }
      })
    })

    // Sort by date
    hearings.sort((a, b) => new Date(a.hearing.date).getTime() - new Date(b.hearing.date).getTime())
    setUpcomingHearings(hearings)
  }, [user, cases])

  function handleDeadlineToggle(deadlineId: string, currentStatus: DocumentDeadline['status']) {
    const newStatus = currentStatus === 'submitted' ? 'pending' : 'submitted'
    updateDeadline(deadlineId, { 
      status: newStatus,
      submittedAt: newStatus === 'submitted' ? new Date().toISOString() : undefined
    })
    setDeadlines(prev => prev.map(d => 
      d.id === deadlineId 
        ? { ...d, status: newStatus, submittedAt: newStatus === 'submitted' ? new Date().toISOString() : undefined }
        : d
    ))
  }

  function getDeadlineUrgency(deadline: DocumentDeadline): 'urgent' | 'warning' | 'normal' {
    const daysUntil = differenceInDays(new Date(deadline.deadlineDate), new Date())
    if (daysUntil < 0) return 'urgent'
    if (daysUntil <= 7) return 'warning'
    return 'normal'
  }

  const pendingDeadlines = deadlines.filter(d => d.status === 'pending')
  const overdueDeadlines = pendingDeadlines.filter(d => isPast(new Date(d.deadlineDate)) && !isToday(new Date(d.deadlineDate)))
  const upcomingDeadlines = pendingDeadlines.filter(d => !isPast(new Date(d.deadlineDate)) || isToday(new Date(d.deadlineDate)))

  if (!user) {
    return <Typography>Please log in</Typography>
  }

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4">Professional Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome, {user.name} ({user.role}). Manage your cases, hearings, and deadlines.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Upcoming Hearings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Hearings
                </Typography>
                {upcomingHearings.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No upcoming hearings
                  </Typography>
                ) : (
                  <List>
                    {upcomingHearings.slice(0, 10).map((item, idx) => (
                      <Box key={item.hearing.id}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle1">{item.hearing.type}</Typography>
                                <Chip 
                                  size="small" 
                                  label={format(new Date(item.hearing.date), 'MMM d, yyyy')}
                                  color={isToday(new Date(item.hearing.date)) ? 'warning' : 'default'}
                                />
                              </Stack>
                            }
                            secondary={
                              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                <Typography variant="body2">
                                  {item.caseTitle} ({item.caseId})
                                </Typography>
                                {item.hearing.time && (
                                  <Typography variant="caption">Time: {item.hearing.time}</Typography>
                                )}
                                {item.hearing.location && (
                                  <Typography variant="caption">Location: {item.hearing.location}</Typography>
                                )}
                                {item.hearing.judge && (
                                  <Typography variant="caption">Judge: {item.hearing.judge}</Typography>
                                )}
                              </Stack>
                            }
                          />
                          <Button 
                            size="small" 
                            onClick={() => navigate(`/cases/${item.caseId}`)}
                          >
                            View Case
                          </Button>
                        </ListItem>
                        {idx < upcomingHearings.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Document Deadlines */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Document Submission Deadlines
                </Typography>
                
                {pendingDeadlines.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No pending deadlines
                  </Typography>
                ) : (
                  <List>
                    {overdueDeadlines.length > 0 && (
                      <>
                        <Typography variant="subtitle2" color="error" sx={{ mt: 1, mb: 1 }}>
                          Overdue ({overdueDeadlines.length})
                        </Typography>
                        {overdueDeadlines.map((deadline) => (
                          <Box key={deadline.id}>
                            <ListItem>
                              <Checkbox
                                checked={deadline.status === 'submitted'}
                                onChange={() => handleDeadlineToggle(deadline.id, deadline.status)}
                              />
                              <ListItemText
                                primary={
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="subtitle1">{deadline.title}</Typography>
                                    <Chip size="small" label="OVERDUE" color="error" />
                                  </Stack>
                                }
                                secondary={
                                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                    <Typography variant="body2">
                                      Due: {format(new Date(deadline.deadlineDate), 'PPP')}
                                    </Typography>
                                    {deadline.description && (
                                      <Typography variant="caption">{deadline.description}</Typography>
                                    )}
                                    {deadline.documentType && (
                                      <Typography variant="caption">Type: {deadline.documentType}</Typography>
                                    )}
                                  </Stack>
                                }
                              />
                            </ListItem>
                            <Divider />
                          </Box>
                        ))}
                      </>
                    )}

                    {upcomingDeadlines.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                          Upcoming ({upcomingDeadlines.length})
                        </Typography>
                        {upcomingDeadlines.map((deadline) => {
                          const urgency = getDeadlineUrgency(deadline)
                          return (
                            <Box key={deadline.id}>
                              <ListItem>
                                <Checkbox
                                  checked={deadline.status === 'submitted'}
                                  onChange={() => handleDeadlineToggle(deadline.id, deadline.status)}
                                />
                                <ListItemText
                                  primary={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Typography variant="subtitle1">{deadline.title}</Typography>
                                      {urgency === 'warning' && (
                                        <Chip size="small" label="DUE SOON" color="warning" />
                                      )}
                                    </Stack>
                                  }
                                  secondary={
                                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                      <Typography variant="body2">
                                        Due: {format(new Date(deadline.deadlineDate), 'PPP')}
                                      </Typography>
                                      {deadline.description && (
                                        <Typography variant="caption">{deadline.description}</Typography>
                                      )}
                                      {deadline.documentType && (
                                        <Typography variant="caption">Type: {deadline.documentType}</Typography>
                                      )}
                                    </Stack>
                                  }
                                />
                              </ListItem>
                              <Divider />
                            </Box>
                          )
                        })}
                      </>
                    )}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Assigned Cases */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              My Assigned Cases
            </Typography>
            {cases.filter(c => c.members?.some(m => m.userId === user.id)).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No cases assigned yet
              </Typography>
            ) : (
              <List>
                {cases
                  .filter(c => c.members?.some(m => m.userId === user.id))
                  .map((caseData, idx) => (
                    <Box key={caseData.id}>
                      <ListItem>
                        <ListItemText
                          primary={`${caseData.id} — ${caseData.title}`}
                          secondary={`${caseData.court} • ${caseData.caseType} • Status: ${caseData.status}`}
                        />
                        <Button onClick={() => navigate(`/cases/${caseData.id}`)}>
                          View Case
                        </Button>
                      </ListItem>
                      {idx < cases.filter(c => c.members?.some(m => m.userId === user.id)).length - 1 && <Divider />}
                    </Box>
                  ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  )
}
