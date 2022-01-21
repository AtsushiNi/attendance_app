import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  Paper, Box, Button } from '@mui/material'
import UsersService from '../../services/UsersService'

export const GroupTable = (props) => {
  const { currentUser } = props
  const [groups, setGroups] = useState([])

  useEffect(() => {
    const func = async () => {
      let groupList = await UsersService.getMyPageGroups(currentUser.id)
      groupList = groupList.adminGroups.concat(groupList.generalGroups)
      setGroups(groupList)
    }
    if(currentUser) {
      func()
    }
  }, [currentUser])

  return (
    <div style={{ margin: 30 }}>
      <Box sx={{justifyContent: 'center', display: 'flex'}}>
        <h3 style={{marginRight: 'auto', display: 'inline-block'}}>部署一覧</h3>
        <Button
          variant='contained'
          style={{height: '40px', width: '140px', marginTop: 'auto', marginBottom: 'auto', visibility: 'hidden'}}
        >
          部署を作成する
        </Button>
      </Box>
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
                    <Link to={'/myPage/groups/'+group.id}>
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
