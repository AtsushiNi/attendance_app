import React from 'react'
import { Authenticator } from '@aws-amplify/ui-react'
import { ProSidebar, Menu, MenuItem, SubMenu, SidebarHeader, SidebarContent } from 'react-pro-sidebar'
import { FaHeart, FaUser, FaUserCheck, FaRegSun } from 'react-icons/fa'
import { MdGroup } from 'react-icons/md'
import '@aws-amplify/ui-react/styles.css'
import './styles/App.scss'

function App() {
  return (
    <div className="App">
      <Authenticator variation='modal'>
        {({signOut, user }) => (
          <div>
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
                  <MenuItem icon={<FaUserCheck />}>承認</MenuItem>
                  <MenuItem icon={<MdGroup />}>部署</MenuItem>
                  <MenuItem icon={<FaUser />}>社員</MenuItem>
                </Menu>
                <Menu>
                  <MenuItem icon={<FaRegSun />}>設定</MenuItem>
                </Menu>
              </SidebarContent>
            </ProSidebar>
            <button onClick={signOut}>sign out</button>
          </div>
        )}
      </Authenticator>
    </div>
  );
}

export default App;
