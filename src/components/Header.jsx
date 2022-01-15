import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Menu as HeaderMenu, MenuItem as HeaderMenuItem } from '@mui/material'
import { AccountCircle } from '@mui/icons-material'

export const Header = ({signOut}) => {
  const [anchorEl, setAnchorEl] = React.useState(null)

  const  handleOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <AppBar>
      <Toolbar>
        <Typography variant='h6' component='div' sx={{flexGrow: 1, textAlign: 'initial'}}>
          〇〇株式会社
        </Typography>
        <div>
          <IconButton
            size='large'
            aria-label='account of current user'
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpen}
          >
            <AccountCircle />
          </IconButton>
          <HeaderMenu
            id='menu-appbar'
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <HeaderMenuItem onClick={signOut}>サインアウト</HeaderMenuItem>
          </HeaderMenu>
        </div>
      </Toolbar>
    </AppBar>
  )
}
