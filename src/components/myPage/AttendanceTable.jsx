import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  Paper, Box, Button } from '@mui/material'
import AttendanceService from '../../services/AttendanceService'

export const AttendanceTable = (props) => {
  const { currentUser } = props
  const [attendances, setAttendances] = useState([])

  useEffect(() => {
    const func = async () => {
      const attendances = await AttendanceService.getAttendances(currentUser.id)
      setAttendances(attendances)
    }
    if(currentUser) {
      func()
    }
  }, [currentUser])

  const handleClickApplication = async (attendance) => {
    await AttendanceService.apply(attendance.id, currentUser.id)
    const attendances = await AttendanceService.getAttendances(currentUser.id)
    setAttendances(attendances)
  }

  return (
    <div style={{ margin: 30 }}>
      <h3 style={{textAlign: 'left'}}>出勤簿</h3>
      <Box sx={{ marginTop: '30px' }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>出勤時間</TableCell>
                <TableCell align='right'>退勤時間</TableCell>
                <TableCell align='right'>状態</TableCell>
                <TableCell align='right'>承認申請</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendances?.map(attendance => (
                <TableRow
                  key={attendance.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component='th' scope='row'>{(new Date(attendance.start_at)).toLocaleString()}</TableCell>
                  <TableCell align='right'>{(new Date(attendance.end_at)).toLocaleString()}</TableCell>
                  <TableCell align='right'>
                    {
                      attendance.status === 'working'?
                        '勤務中'
                        : attendance.status === 'finished'?
                          '未承認'
                          : attendance.status === 'unapproved'?
                            '申請中'
                            :attendance.status === 'approved'?
                              '承認済み'
                              :attendance.status === 'needCorrection'?
                                '要修正'
                                :''
                    }
                  </TableCell>
                  <TableCell align='right'>
                    <Button
                      variant='outlined'
                      disabled={(attendance.status !== 'finished')}
                      onClick={() => handleClickApplication(attendance)}
                    >
                      申請
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  )
}
