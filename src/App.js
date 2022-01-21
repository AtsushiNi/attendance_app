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
import { Route, Routes, Link, useLocation } from 'react-router-dom'
import { MdGroup } from 'react-icons/md'
import '@aws-amplify/ui-react/styles.css'
import './styles/App.scss'

import { Header } from './components/Header'
import { GroupTable } from './components/GroupTable'
import { GroupInfo } from './components/GroupInfo'
import { UserTable } from './components/UserTable'
import { UserInfo } from './components/UserInfo'

function App() {
  const params = useLocation()
  const getStyle = (id) => {
    if(params.pathname.indexOf(id) !== -1)
      return(
        {
          backgroundColor: 'rgba(255,255,255,0.1)'
        }
      )
    else {
      return({})
    }
  }

  return (
    <Authenticator variation='modal'>
      {({signOut, user }) => (
        <div className='App'>
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
                <MenuItem icon={<FaUserCheck />} style={getStyle('application')} id='application'>
                  承認
                  <Link to='/applications' />
                </MenuItem>
                <MenuItem icon={<MdGroup />} style={getStyle('groups')} id='groups'>
                  部署
                  <Link to='/groups' />
                </MenuItem>
                <MenuItem icon={<FaUser />} style={getStyle('users')} id='users'>
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
            <Header signOut={signOut} />
            <Routes>
              <Route path='/mypage'>
              </Route>
              <Route path='/groups' element={<GroupTable />}>
              </Route>
              <Route path='/groups/:id' element={<GroupInfo />}>
              </Route>
              <Route path='/users' element={<UserTable />}>
              </Route>
              <Route path='/users/:id' element={<UserInfo />}>
              </Route>
              <Route path='/settings'>
              </Route>
            </Routes>
          </main>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
