import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Card, CardContent, List, ListItem, Avatar, Typography, Divider, Table, TableBody, TableRow, TableCell } from  '@mui/material'
import GroupsService from '../services/GroupsService'

export const GroupInfo = () => {
  const { id } = useParams()
  const [group, setGroup] = useState(null)

  useEffect(async () => {
    const groupInfo = await GroupsService.getGroup(id)
    setGroup(groupInfo)
  }, [])

  return  (
    <div style={{ margin: 30 }}>
      <h3 style={{ textAlign: 'left' }}>部署詳細</h3>
      <Box sx={{ marginTop: '30px' }}>
        <Card sx={{ margin: '20px' }}>
          <CardContent>
            <List>
              <ListItem>
                <Typography variant='h4'>{group?.name}</Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <h3>所属社員一覧</h3>
              </ListItem>
              <ListItem>
                <Table>
                  <TableBody>
                    {group?.adminUsers.map(user => (
                      <TableRow>
                        <TableCell>承認者</TableCell>
                        <TableCell>
                          <Link to={'/users/'+user.id}>
                            {user.last_name+user.first_name}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {group?.generalUsers.map(user => (
                      <TableRow>
                        <TableCell>一般社員</TableCell>
                        <TableCell>
                          <Link to={'/users/'+user.id}>
                            {user.last_name+user.first_name}
                          </Link>
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
