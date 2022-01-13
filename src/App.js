import React from 'react'
import './App.css';
import { Authenticator } from '@aws-amplify/ui-react'
import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar'
import { FaHeart, FaGem} from 'react-icons/fa'
import 'react-pro-sidebar/dist/css/styles.css'
import '@aws-amplify/ui-react/styles.css'

function App() {
  return (
    <div className="App">
      <Authenticator valiation='modal'>
        <ProSidebar>
          <Menu iconShape='square'>
            <MenuItem icon={<FaGem />}>Dashboard</MenuItem>
            <SubMenu title='components' icon={<FaHeart />}>
              <MenuItem>Component 1</MenuItem>
              <MenuItem>Component 2</MenuItem>
            </SubMenu>
          </Menu>
        </ProSidebar>
      </Authenticator>
    </div>
  );
}

export default App;
