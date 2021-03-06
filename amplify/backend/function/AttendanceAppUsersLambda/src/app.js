/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const AWS = require('aws-sdk')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var bodyParser = require('body-parser')
var express = require('express')
const useUser = require('./models/User')
const useGroup = require('./models/Group')
const useUserGroupAdmin = require('./models/UserGroupAdmin')
const useUserGroupGeneral = require('./models/UserGroupGeneral')

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

// models
const User = new useUser(dynamodb)
const Group = new useGroup(dynamodb)
const UserGroupAdmin = new useUserGroupAdmin(dynamodb)
const UserGroupGeneral = new useUserGroupGeneral(dynamodb)

/********************************
 * HTTP Get method for list objects *
 ********************************/
app.get('/users', async function(req, res) {
  if(!req.query.email){
    try {
      const users = await User.scan()

      res.json(users)
    } catch (error) {
      res.statusCode = 500
      res.json(error)
    }
  } else {
    const email = req.query.email
    try {
      const user = await User.getByEmail(email)

      res.json(user)
    } catch (error) {
      res.statusCode = 500
      res.json(error)
    }
  }
})

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get('/users/:id',  async function(req, res) {
  const id = parseInt(req.params.id)
  try {
    const user = await User.get(id)
    res.json(user)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }
});

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get('/users/:id/users',  async function(req, res) {
  const id = parseInt(req.params.id)

  let adminGroupIDs
  let generalGroupIDs
  try {
    adminGroupIDs = await UserGroupAdmin.getGroupIDsByUserId(id)
    generalGroupIDs = await UserGroupGeneral.getGroupIDsByUserId(id)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }
  const groupIDs = Array.from(new Set(adminGroupIDs.concat(generalGroupIDs)))

  let adminUserIDs = await Promise.all(groupIDs.map(async id => {
    return await UserGroupAdmin.getUserIDsByGroupId(id)
  }))
  adminUserIDs = Array.from(new Set(adminUserIDs.flat()))
  let generalUserIDs = await Promise.all(groupIDs.map(async id => {
    return await UserGroupGeneral.getUserIDsByGroupId(id)
  }))
  generalUserIDs = Array.from(new Set(generalUserIDs.flat()))

  const userIDs = Array.from(new Set(adminUserIDs.concat(generalUserIDs)))
  try {
    const users = await User.batchGet(userIDs)
    res.json(users)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }
});

/********************************
 * HTTP Get method for groups in single user
 ********************************/
app.get('/users/:id/groups', async function(req, res) {
  // get admin groups
  const id = parseInt(req.params.id)
  let adminGroupIDs
  try {
    adminGroupIDs = await UserGroupAdmin.getGroupIDsByUserId(id)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }

  let adminGroups
  try {
    adminGroups = await Group.batchGet(adminGroupIDs)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }

  // get general groups
  let generalGroupIDs
  try {
    generalGroupIDs = await UserGroupGeneral.getGroupIDsByUserId(id)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }

  let generalGroups
  try {
    generalGroups = await Group.batchGet(generalGroupIDs)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }

  res.json({adminGroups: adminGroups, generalGroups: generalGroups})
})

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
