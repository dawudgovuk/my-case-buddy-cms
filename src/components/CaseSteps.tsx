import { Box, Stepper, Step, StepLabel, StepContent, Paper, Typography } from '@mui/material'
import type { CaseStageInfo } from '../utils/caseStages'

interface CaseStepsProps {
  stages: CaseStageInfo[]
  currentStageIndex: number
}

export default function CaseSteps({ stages, currentStageIndex }: CaseStepsProps) {
  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Stepper activeStep={currentStageIndex} orientation="vertical">
        {stages.map((stage, index) => (
          <Step key={stage.id} completed={index < currentStageIndex} active={index === currentStageIndex}>
            <StepLabel>
              <Typography variant="h6">{stage.name}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                {stage.description}
              </Typography>
              {index === currentStageIndex && (
                <Paper sx={{ mt: 1, p: 1, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="caption">Current Stage</Typography>
                </Paper>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  )
}
