import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  Paper, Box } from '@mui/material'
import UsersService from '../services/UsersService'

export const UserTable = () => {
  const [users, setUsers] = useState([])

  useEffect(async () => {
    const userList = await UsersService.getUsers()
    setUsers(userList)
  }, [])

  return (
    <div style={{ margin: 30 }}>
      <h3 style={{textAlign: 'left'}}>社員一覧</h3>
      <Box sx={{ marginTop: '30px' }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell align='right'>苗字</TableCell>
                <TableCell align='right'>名前</TableCell>
                <TableCell align='right'>メールアドレス</TableCell>
                <TableCell align='right'>電話番号</TableCell>
                <TableCell align='right'>雇用形態</TableCell>
                <TableCell align='right'>管理者</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow
                  key={user.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component='th' scope='row'>
                    <Link to={'/users/'+user.id}>
                      {user.id}
                    </Link>
                  </TableCell>
                  <TableCell align='right'>{user.last_name}</TableCell>
                  <TableCell align='right'>{user.first_name}</TableCell>
                  <TableCell align='right'>{user.e_mail}</TableCell>
                  <TableCell align='right'>{user.phone_number}</TableCell>
                  <TableCell align='right'>{user.work_type}</TableCell>
                  <TableCell align='right'>{user.is_admin? '○': '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  )
}
