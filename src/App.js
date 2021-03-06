import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import '@aws-amplify/ui-react/styles.css'
import './styles/App.scss'

import UsersService from './services/UsersService'

import { Header } from './components/Header'
import { Sidebar} from './components/Sidebar'
import { GroupTable } from './components/GroupTable'
import { GroupInfo } from './components/GroupInfo'
import { UserTable } from './components/UserTable'
import { UserInfo } from './components/UserInfo'
import { GroupTable as MyPageGroupTable } from './components/myPage/GroupTable'
import { UserTable as MyPageUserTable } from './components/myPage/UserTable'
import { Stamping } from './components/myPage/Stamping'
import { AttendanceTable } from './components/myPage/AttendanceTable'

function App(props) {
  const { signOut, currentUserInfo } = props
  const [currentUser, setCurrentUser] = useState(null)
  useEffect(() => {
    const func = async () => {
      const user = await UsersService.getByEmail(currentUserInfo.attributes.email)
      setCurrentUser(user)
    }
    if(currentUserInfo) {
      func()
    }
  }, [currentUserInfo])

  return (
        <div className='App'>
          <Sidebar currentUser={currentUser}/>
          <main>
            <Header signOut={signOut} />
            <Routes>
              <Route path='/mypage/stamping' element={<Stamping currentUser={currentUser} />} />
              <Route path='/mypage/attendances' element={<AttendanceTable currentUser={currentUser}/>} />
              <Route path='/mypage/users' element={<MyPageUserTable currentUser={currentUser}/>} />
              <Route path='/mypage/users/:id' element={<UserInfo isAdmin={false} />} />
              <Route path='/mypage/groups' element={<MyPageGroupTable currentUser={currentUser} />} />
              <Route path='/mypage/groups/:id' element={<GroupInfo isAdmin={false} />} />
              <Route path='/groups' element={<GroupTable />} />
              <Route path='/groups/:id' element={<GroupInfo isAdmin={true} />} />
              <Route path='/users' element={<UserTable />} />
              <Route path='/users/:id' element={<UserInfo isAdmin={true} />} />
              <Route path='/settings' />
            </Routes>
          </main>
        </div>
  );
}

export default App;
