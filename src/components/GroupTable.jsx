import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  Paper, Box } from '@mui/material'
import GroupsService from '../services/GroupsService'

export const GroupTable = () => {
  const [groups, setGroups] = useState([])

  useEffect(async () => {
    const groupList = await GroupsService.getGroups()
    setGroups(groupList)
  }, [])

  return (
    <div style={{ margin: 30 }}>
      <h3 style={{textAlign: 'left'}}>部署一覧</h3>
      <Box sx={{ marginTop: '30px' }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell align='right'>名前</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map(group => (
                <TableRow
                  key={group.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component='th' scope='row'>
                    <Link to={'/groups/'+group.id}>
                      {group.id}
                    </Link>
                  </TableCell>
                  <TableCell align='right'>{group.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  )
}
