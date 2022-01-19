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

var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

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
app.get('/groups', async function(req, res) {
  try {
    const groups = await Group.scan()
    res.json(groups)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }
})

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

 app.get('/groups/:id', async function(req, res) {
  const id = parseInt(req.params.id)

  // get group
  let group
  try {
    group = await Group.get(id)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }

  // get admin users
  let adminUserIDs
  try {
    adminUserIDs = await UserGroupAdmin.getUserIDsByGroupId(id)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }

  let adminUsers
  try {
    adminUsers = await User.batchGet(adminUserIDs)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }

  // get general users
  let generalUserIDs
  try {
    generalUserIDs = await UserGroupGeneral.getUserIDsByGroupId(id)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }

  let generalUsers
  try {
    generalUsers = await User.batchGet(generalUserIDs)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }

  group['adminUsers'] = adminUsers
  group['generalUsers'] = generalUsers
  res.json(group)
});

/************************************
* HTTP post method for insert object *
*************************************/
app.post('/groups', async function(req, res) {
  // group作成
  let id
  try {
    id = await Group.create(req.body.name)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }

  // adminユーザー作成
  if(req.body.adminIDs.length) {
    try {
      await UserGroupAdmin.batchCreate(id, req.body.adminIDs)
    } catch (error) {
      res.statusCode = 500
      res.json(error)
    }
  }

  // generalユーザー作成
  if(req.body.generalIDs.length) {
    try {
      await UserGroupGeneral.batchCreate(id, req.body.generalIDs)
    } catch (error) {
      res.statusCode = 500
      res.json(error)
    }
  }

  res.json({ message: 'group created' })
});

/************************************
* HTTP put method
*************************************/
app.put('/groups/:id', async function(req, res) {
  const id = parseInt(req.params.id)

  // group更新
  const updateParams = { name: req.body.name }
  try {
    await Group.update(id, updateParams)
  } catch (error) {
    res.statusCode = 500
    res.json(error)
  }

  // adminユーザー作成
  if(req.body.addedAdminIDs.length) {
    try {
      await UserGroupAdmin.batchCreate(id, req.body.addedAdminIDs)
    } catch (error) {
      res.statusCode = 500
      res.json(error)
    }
  }

  // generalユーザー作成
  if(req.body.addedGeneralIDs.length) {
    try {
      await UserGroupGeneral.batchCreate(id, req.body.addedGeneralIDs)
    } catch (error) {
      res.statusCode = 500
      res.json(error)
    }
  }

  // adminユーザー削除
  if(req.body.deletedAdminIDs.length) {
    let relations
    try {
      relations = await UserGroupAdmin.queryByGroupId(id)
    } catch(error) {
      res.statusCode = 500
      res.json(error)
    }

    await Promise.all(relations.map(async relation => {
      if(req.body.deletedAdminIDs.includes(relation.user_id)) {
        try {
          await UserGroupAdmin.delete(relation.id)
        } catch (error) {
          res.statusCode = 500
          res.json(error)
        }
      }
    }))
  }

  // generalユーザー削除
  if(req.body.deletedGeneralIDs.length) {
    let relations
    try {
      relations = await UserGroupGeneral.queryByGroupId(id)
    } catch(error) {
      res.statusCode = 500
      res.json(error)
    }

    await Promise.all(relations.map(async relation => {
      if(req.body.deletedGeneralIDs.includes(relation.user_id)) {
        try {
          await UserGroupGeneral.delete(relation.id)
        } catch (error) {
          res.statusCode = 500
          res.json(error)
        }
      }
    }))
  }

  res.json({message: 'delete completed!'})
})

module.exports = app
