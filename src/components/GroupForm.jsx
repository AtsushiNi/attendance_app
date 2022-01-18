import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, Box, Grid, Typography, TextField, Select, Chip, MenuItem, DialogActions, Button } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useTheme } from '@mui/material/styles'
import UsersService from '../services/UsersService'

export const GroupForm = (props) => {
  const { initGroup, isOpen, closeModal, submit } = props

  const theme = useTheme()
  const [users, setUsers] = useState([])
  const [groupName, setGroupName] = useState('')
  const [selectedAdmins, setSelectedAdmins] = useState([])
  const [selectedAdminIDs, setSelectedAdminIDs] = useState([])
  const [selectedGenerals, setSelectedGenerals] = useState([])
  const [selectedGeneralIDs, setSelectedGeneralIDs] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const func = async () => {
      const userList = await UsersService.getUsers()
      setUsers(userList)
    }
    func()
    initInputs()
  }, [initGroup])

  useEffect(() => {
    initInputs()
  }, [isOpen])

  const getItemStyle = (id, selectedIDs, theme) => {
    return {
      fontWeight:
        selectedIDs.indexOf(id) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium
    }
  }

  const initInputs = () => {
    setGroupName(initGroup? initGroup.name : '')
    setSelectedAdmins(initGroup? initGroup.adminUsers : [])
    setSelectedAdminIDs(initGroup? initGroup.adminUsers.map(user => user.id) : [])
    setSelectedGenerals(initGroup? initGroup.generalUsers : [])
    setSelectedGeneralIDs(initGroup? initGroup.generalUsers.map(user => user.id) : [])
  }

  const handleCloseModal = () => {
    closeModal()
    initInputs()
    setIsLoading(false)
  }
  const handleChangeGroupName = (event) => setGroupName(event.target.value)

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

  const handleSubmit = async () => {
    setIsLoading(true)
    await submit(groupName, selectedAdminIDs, selectedGeneralIDs)
    initInputs()
    setIsLoading(false)
    closeModal(false)
  }

  return (
    <Dialog
      onClose={handleCloseModal}
      open={isOpen}
    >
      <DialogTitle>新規部署作成</DialogTitle>
      <DialogContent dividers>
        <Box sx={{width: 500, height: 600}}>
          <Grid container alignItems='center'>
            <Grid item xs={4}>
              <Typography sx={{m: '30px', ml: '10px'}}>部署名</Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField sx={{textAlign: 'middle'}} onChange={handleChangeGroupName} value={groupName}/>
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
        <Button onClick={handleCloseModal}>キャンセル</Button>
      </DialogActions>
    </Dialog>
  )
}
