import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Card, CardContent, List, ListItem, Avatar, Typography, Divider, Table, TableHead, TableBody, TableRow, TableCell } from  '@mui/material'
import UsersService from '../services/UsersService'

export const UserInfo = () => {
  const { id } = useParams()
  const [user, setUser] = useState(null)

  useEffect(async () => {
    const userInfo = await UsersService.getUserWithGroups(id)
    setUser(userInfo)
  }, [])

  return (
    <div style={{ margin: 30 }}>
      <h3 style={{ textAlign: 'left' }}>社員詳細</h3>
      <Box sx={{ marginTop: '30px' }}>
        <Card sx={{ margin: '20px' }}>
          <CardContent>
            <List>
              <ListItem>
                <Avatar sx={{ width: 60, height: 60 }}/>
                <Typography variant='h4' sx={{ ml: 5 }}>{user && user.last_name+user.first_name}</Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <h3>基本情報</h3>
              </ListItem>
              <ListItem>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>苗字</TableCell>
                      <TableCell>{user?.last_name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>名前</TableCell>
                      <TableCell>{user?.first_name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>メールアドレス</TableCell>
                      <TableCell>{user?.e_mail}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>電話番号</TableCell>
                      <TableCell>{user?.phone_number}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>雇用形態</TableCell>
                      <TableCell>{user?.work_type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>管理者権限</TableCell>
                      <TableCell>{user?.is_admin? '◯':'×'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ListItem>
            </List>
          </CardContent>
        </Card>
        <Card sx={{ margin: '20px' }}>
          <CardContent>
            <List>
              <ListItem>
                <h3>所属部署</h3>
              </ListItem>
              <ListItem>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        部署名
                      </TableCell>
                      <TableCell>
                        部署内の役割
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {user?.adminGroups.map(group => (
                      <TableRow>
                        <TableCell>
                          <Link to={'/groups/'+group.id}>
                            {group.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          承認者
                        </TableCell>
                      </TableRow>
                    ))}
                    {user?.generalGroups.map(group => (
                      <TableRow>
                        <TableCell>
                          <Link to={'/groups/'+group.id}>
                            {group.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          一般社員
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>
    </div>
  )
}
