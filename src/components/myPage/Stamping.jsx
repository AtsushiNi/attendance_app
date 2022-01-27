import React, { useState, useEffect } from 'react'
import { DateTimePicker, LocalizationProvider } from '@mui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { useTime } from 'react-timer-hook'
import { Box, Typography, Button, TextField } from '@mui/material'
import AttendanceService from '../../services/AttendanceService'

export const Stamping = (props) => {
  const [currentUser, setCurrentUser] = useState(null)
  const { seconds, minutes, hours } = useTime({})
  const [isShow, setIsShow] = useState(false)
  const [time, setTime] = useState(new Date())
  const displayNumber = (number) => (("0"+number).slice(-2))
  const handleChange = (newValue) => setTime(newValue)

  useEffect(() => {
    setCurrentUser(props.currentUser)
  }, [props])

  const handleStartWork = () => {
    if (isShow) {
      AttendanceService.startWork(new Date(), currentUser.id)
    } else {
      AttendanceService.startWork(time, currentUser.id)
    }
  }

  const handleFinishWork = () => {
    if (isShow) {
      AttendanceService.finishWork(new Date(), currentUser.id)
    } else {
      AttendanceService.finishWork(time, currentUser.id)
    }
  }

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
            <Button
              variant='contained'
              onClick={handleStartWork}
              sx={{height: '130px', width: '130px', borderRadius:'100px', marginRight: '50px', fontSize: '20px'}}
            >
              出勤
            </Button>
            <Button
              variant='contained'
              onClick={handleFinishWork}
              sx={{height: '130px', width: '130px', borderRadius:'100px', fontSize: '20px'}}>
              退勤
            </Button>
          </Box>
        </Box>
      </Box>
      <Button onClick={() => setIsShow(!isShow)}>set time</Button>
    {
      isShow &&
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker value={time} onChange={handleChange} renderInput={(params) => <TextField {...params} />}/>
        </LocalizationProvider>
    }
    </div>
  )
}
