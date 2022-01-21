import React from 'react'
import { Authenticator } from '@aws-amplify/ui-react'
import { Route, Routes } from 'react-router-dom'
import '@aws-amplify/ui-react/styles.css'
import './styles/App.scss'

import { Header } from './components/Header'
import { Sidebar} from './components/Sidebar'
import { GroupTable } from './components/GroupTable'
import { GroupInfo } from './components/GroupInfo'
import { UserTable } from './components/UserTable'
import { UserInfo } from './components/UserInfo'

function App() {
  return (
    <Authenticator variation='modal'>
      {({signOut, user }) => (
        <div className='App'>
          <Sidebar currentUser={user}/>
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
