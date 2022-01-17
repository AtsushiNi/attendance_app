import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  Paper, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Select, Chip, MenuItem, Grid } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useTheme } from '@mui/material/styles'
import GroupsService from '../services/GroupsService'
import UsersService from '../services/UsersService'

export const GroupTable = () => {
  const theme = useTheme()

  const [groups, setGroups] = useState([])
  const [users, setUsers] = useState([])
  const [groupName, setGroupName] = useState('')
  const [selectedAdmins, setSelectedAdmins] = useState([])
  const [selectedAdminIDs, setSelectedAdminIDs] = useState([])
  const [selectedGenerals, setSelectedGenerals] = useState([])
  const [selectedGeneralIDs, setSelectedGeneralIDs] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(async () => {
    const groupList = await GroupsService.getGroups()
    setGroups(groupList)
  }, [])

  useEffect(async () => {
    const userList = await UsersService.getUsers()
    setUsers(userList)
  }, [])

  const getItemStyle = (id, selectedIDs, theme) => {
    return {
      fontWeight:
        selectedIDs.indexOf(id) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium
    }
  }
  const openCreateModal = () => setShowCreateModal(true)
  const closeCreateModal = () => {
    setShowCreateModal(false)
    setGroupName('')
    setSelectedAdmins([])
    setSelectedAdminIDs([])
    setSelectedGenerals([])
    setSelectedGeneralIDs([])
    setIsLoading(false)
  }
  const handleChangeGroupName = (event) => setGroupName(event.target.value)

  const handleSubmit = async () => {
    setIsLoading(true)
    await GroupsService.create({
      name: groupName,
      adminIDs: selectedAdminIDs,
      generalIDs: selectedGeneralIDs
    })
    setGroups(await GroupsService.getGroups())
    setGroupName('')
    setSelectedAdmins([])
    setSelectedAdminIDs([])
    setSelectedGenerals([])
    setSelectedGeneralIDs([])
    setIsLoading(false)
    setShowCreateModal(false)
  }

  const handleSelectAdminChange = event => {
    const { target: { value } } = event
    const targetID = value.pop()
    const oldIDs = selectedAdminIDs.concat()
    let newIDs = []

    if(oldIDs.includes(targetID)) {
      newIDs = oldIDs.filter(id => id !== targetID)
      setSelectedAdminIDs(newIDs)
    } else {
      oldIDs.push(targetID)
      newIDs = oldIDs
      setSelectedAdminIDs(oldIDs)
    }
    const newSelectedAdmins = users.filter(user => newIDs.includes(user.id))
    setSelectedAdmins(newSelectedAdmins)
  }

  const handleSelectGeneralChange = event => {
    const { target: { value } } = event
    const targetID = value.pop()
    const oldIDs = selectedGeneralIDs.concat()
    let newIDs = []

    if(oldIDs.includes(targetID)) {
      newIDs = oldIDs.filter(id => id !== targetID)
      setSelectedGeneralIDs(newIDs)
    } else {
      oldIDs.push(targetID)
      newIDs = oldIDs
      setSelectedGeneralIDs(oldIDs)
    }
    const newSelectedGenerals = users.filter(user => newIDs.includes(user.id))
    setSelectedGenerals(newSelectedGenerals)
  }

  return (
    <div style={{ margin: 30 }}>
      <Box sx={{justifyContent: 'center', display: 'flex'}}>
        <h3 style={{marginRight: 'auto', display: 'inline-block'}}>部署一覧</h3>
        <Button
          variant='contained'
          style={{height: '40px', marginTop: 'auto', marginBottom: 'auto'}}
          onClick={openCreateModal}
        >
          部署を作成する
        </Button>
        <Dialog
          onClose={closeCreateModal}
          open={showCreateModal}
        >
          <DialogTitle>新規部署作成</DialogTitle>
          <DialogContent dividers>
            <Box sx={{width: 500, height: 600}}>
              <Grid container alignItems='center'>
                <Grid item xs={4}>
                  <Typography sx={{m: '30px', ml: '10px'}}>部署名</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField label='project name' sx={{textAlign: 'middle'}} onChange={handleChangeGroupName}/>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{m: '30px', ml: '10px'}}>承認者</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Select
                    multiple
                    value={selectedAdmins.map(u => (u.last_name+u.first_name))}
                    onChange={handleSelectAdminChange}
                    renderValue={selected => (
                      <Box>
                        {selected.map(value => <Chip key={value} label={value}/>)}
                      </Box>
                    )}
                  >
                    {users?.map(u => (
                      <MenuItem
                        key={u.id}
                        value={u.id}
                        style={getItemStyle(u.id, selectedAdminIDs, theme)}
                      >
                        {u.last_name+u.first_name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{m: '30px', ml: '10px'}}>一般社員</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Select
                    multiple
                    value={selectedGenerals.map(u => (u.last_name+u.first_name))}
                    onChange={handleSelectGeneralChange}
                    renderValue={selected => (
                      <Box>
                        {selected.map(value => <Chip key={value} label={value}/>)}
                      </Box>
                    )}
                  >
                    {users?.map(u => (
                      <MenuItem
                        key={u.id}
                        value={u.id}
                        style={getItemStyle(u.id, selectedGeneralIDs, theme)}
                      >
                        {u.last_name+u.first_name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            {/* <Button variant='contained' onClick={handleSubmit}>作成</Button> */}
            <LoadingButton variant='contained' onClick={handleSubmit} loading={isLoading}>作成</LoadingButton>
            <Button onClick={closeCreateModal}>キャンセル</Button>
          </DialogActions>
        </Dialog>
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
