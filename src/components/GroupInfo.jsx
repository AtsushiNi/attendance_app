import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Card, CardContent, List, ListItem, Typography, Divider, Table, TableBody, TableRow, TableCell, Button } from  '@mui/material'
import GroupsService from '../services/GroupsService'
import { GroupForm } from '../components/GroupForm'

export const GroupInfo = () => {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(async () => {
    const groupInfo = await GroupsService.getGroup(id)
    setGroup(groupInfo)
  }, [])

  const handleSubmit = async (groupName, adminIDs, generalIDs) => {
    const oldAdminIDs = group.adminUsers.map(user => user.id)
    const oldGeneralIDs = group.generalUsers.map(user => user.id)
    const addedAdminIDs = adminIDs.filter(id => oldAdminIDs.indexOf(id) == -1)
    const deletedAdminIDs = oldAdminIDs.filter(id => adminIDs.indexOf(id) == -1)
    const addedGeneralIDs = generalIDs.filter(id => oldGeneralIDs.indexOf(id) == -1)
    const deletedGeneralIDs = oldGeneralIDs.filter(id => generalIDs.indexOf(id) == -1)

    await GroupsService.update({
      id: id,
      name: groupName,
      addedAdminIDs: addedAdminIDs,
      deletedAdminIDs: deletedAdminIDs,
      addedGeneralIDs: addedGeneralIDs,
      deletedGeneralIDs: deletedGeneralIDs
    })
    setGroup(await GroupsService.getGroup(id))
  }

  return  (
    <div style={{ margin: 30 }}>
      <Box sx={{justifyContent: 'center', display: 'flex'}}>
        <h3 style={{marginRight: 'auto', display: 'inline-block'}}>部署詳細</h3>
        <Button
          variant='contained'
          style={{height: '40px', width: '140px', marginTop: 'auto', marginBottom: 'auto'}}
          onClick={() => setIsModalOpen(true)}
        >
          編集する
        </Button>
        <GroupForm initGroup={group} isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} submit={handleSubmit} />
      </Box>
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
