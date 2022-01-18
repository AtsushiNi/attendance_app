import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  Paper, Box, Button } from '@mui/material'
import GroupsService from '../services/GroupsService'
import { GroupForm } from '../components/GroupForm'

export const GroupTable = () => {

  const [groups, setGroups] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const func = async () => {
      const groupList = await GroupsService.getGroups()
      setGroups(groupList)
    }
    func()
  }, [])

  const handleSubmit = async (groupName, adminIDs, generalIDs) => {
    await GroupsService.create({
      name: groupName,
      adminIDs: adminIDs,
      generalIDs: generalIDs
    })
    setGroups(await GroupsService.getGroups())
  }

  return (
    <div style={{ margin: 30 }}>
      <Box sx={{justifyContent: 'center', display: 'flex'}}>
        <h3 style={{marginRight: 'auto', display: 'inline-block'}}>部署一覧</h3>
        <Button
          variant='contained'
          style={{height: '40px', width: '140px', marginTop: 'auto', marginBottom: 'auto'}}
          onClick={() => setIsModalOpen(true)}
        >
          部署を作成する
        </Button>
        <GroupForm isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} submit={handleSubmit}/>
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
