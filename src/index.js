import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Amplify, { API } from 'aws-amplify';
import config from './aws-exports';

Amplify.configure(config);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

const apiName = 'AttendanceAppUsersApi'
const path = '/users/1'
API
  .get(apiName, path)
  .then(response => {
    document.getElementById('msg').innerHTML =response
  })
  .catch(error => {
    console.error(error.respoonse)
  })
