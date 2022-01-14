import React from 'react'
import { Authenticator } from '@aws-amplify/ui-react'
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarHeader,
  SidebarContent
} from 'react-pro-sidebar'
import {
  FaHeart,
  FaUser,
  FaUserCheck,
  FaRegSun
} from 'react-icons/fa'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import { MdGroup } from 'react-icons/md'
import { AppBar, Toolbar, Typography, IconButton, Menu as HeaderMenu, MenuItem as HeaderMenuItem } from '@mui/material'
import { AccountCircle } from '@mui/icons-material'
import '@aws-amplify/ui-react/styles.css'
import './styles/App.scss'

function App() {
  const [anchorEl, setAnchorEl] = React.useState(null)

  const  handleOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div className="App">
      <Authenticator variation='modal'>
        {({signOut, user }) => (
          <Router>
            <ProSidebar>
              <SidebarHeader>
                <div
                  style={{
                    padding: '24px',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    fontSize: 14,
                    letterSpacing: '1px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Attendance App
                </div>
              </SidebarHeader>
              <SidebarContent>
                <Menu iconShape='square'>
                  <SubMenu title='マイページ' icon={<FaHeart />}>
                    <MenuItem>打刻</MenuItem>
                    <MenuItem>出勤簿</MenuItem>
                    <MenuItem>申請</MenuItem>
                    <MenuItem>メンバー</MenuItem>
                    <MenuItem>所属部署</MenuItem>
                  </SubMenu>
                  <MenuItem icon={<FaUserCheck />}>
                    承認
                    <Link to='/applications' />
                  </MenuItem>
                  <MenuItem icon={<MdGroup />}>
                    部署
                    <Link to='/groups' />
                  </MenuItem>
                  <MenuItem icon={<FaUser />}>
                    社員
                    <Link to='/users' />
                  </MenuItem>
                </Menu>
                <Menu>
                  <MenuItem icon={<FaRegSun />}>
                    設定
                    <Link to='/settings' />
                  </MenuItem>
                </Menu>
              </SidebarContent>
            </ProSidebar>

            <main>
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
              <Routes>
                <Route path='/mypage'>
                </Route>
                <Route path='/groups'>
                </Route>
                <Route path='/users'>
                </Route>
                <Route path='/settings'>
                </Route>
              </Routes>
            </main>
          </Router>
        )}
      </Authenticator>
    </div>
  );
}

export default App;
