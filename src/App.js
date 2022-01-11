import React from 'react'
import './App.css';
import { Authenticator } from '@aws-amplify/ui-react'
import { Admin, Resource, ListGuesser } from 'react-admin'
import jsonServerProvider from 'ra-data-json-server'
import '@aws-amplify/ui-react/styles.css'

const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com')

function App() {
  return (
    <div className="App">
      <Authenticator variation='modal'>
        {({ signOut, user  }) => (
          <main>
            <Admin dataProvider={dataProvider}>
              <Resource name="users" list={ListGuesser} />
            </Admin>
            <button onClick={signOut}>Sign out</button>
          </main>
        )}
        </Authenticator>
    </div>
  );
}

export default App;
