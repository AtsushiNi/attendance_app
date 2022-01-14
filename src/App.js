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
import '@aws-amplify/ui-react/styles.css'
import './styles/App.scss'

function App() {
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
              <button onClick={signOut}>sign out</button>
            </main>
          </Router>
        )}
      </Authenticator>
    </div>
  );
}

export default App;
