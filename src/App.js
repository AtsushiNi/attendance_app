import React from 'react'
import './App.css';
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

function App() {
  return (
    <div className="App">
      <Authenticator variation='modal'>
        {({ signOut, user  }) => (
          <main>
            <h1>Herro {user.username}</h1>
            <button onClick={signOut}>Sign out</button>
          </main>
        )}
        </Authenticator>
    </div>
  );
}

export default App;
