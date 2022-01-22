import React, { useState } from 'react'
import { DateTimePicker } from '@mui/lab'
import { useTime } from 'react-timer-hook'
import { Box, Typography, Button } from '@mui/material'

export const Stamping = () => {
  const { seconds, minutes, hours } = useTime({})
  const displayNumber = (number) => (("0"+number).slice(-2))

  return (
    <div style={{ margin: 30, height: '100%' }}>
      <Box sx={{display: 'flex'}}>
        <h3 style={{marginRight: 'auto'}}>打刻</h3>
      </Box>
      <Box sx={{height: '100%', margin: '100px'}}>
        <Box sx={{display: 'flex', marginTop: '10%', marginBottom: 'auto'}}>
          <Box>
            <Box>
              <Typography variant='h5'>
                2022年2月22日
              </Typography>
            </Box>
            <Box sx={{display: 'flex'}}>
              <Typography variant='h1'>
                {displayNumber(hours)}:{displayNumber(minutes)}
              </Typography>
              <Typography variant='h5' sx={{marginTop: 'auto', marginBottom: '15px', margiinLeft: '10px'}}>
                {displayNumber(seconds)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{marginTop: 'auto', marginBottom: 'auto', marginLeft: '100px'}}>
            <Button variant='contained' sx={{height: '130px', width: '130px', borderRadius:'100px', marginRight: '50px', fontSize: '20px'}}>
              出勤
            </Button>
            <Button variant='contained' sx={{height: '130px', width: '130px', borderRadius:'100px', fontSize: '20px'}}>
              退勤
            </Button>
          </Box>
        </Box>
      </Box>
    </div>
  )
}
