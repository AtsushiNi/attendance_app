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

let tableName = "AttendanceAppGroupsTable";
if(process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

const userIdPresent = false;
const partitionKeyName = "id";
const partitionKeyType = "N";
const path = "/groups";
const UNAUTH = 'UNAUTH';
const hashKeyPath = '/:' + partitionKeyName;

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

const convertUrlType = (param, type) => {
  switch(type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
}

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
app.post(path, async function(req, res) {
  // group作成
  const groupMaxID = await getMaxID(tableName)
  let putItemParams = {
    TableName: tableName,
    Item: {
      id: (groupMaxID + 1),
      name: req.body.name
    }
  }
  await new Promise((resolve, reject) => {
    dynamodb.put(putItemParams, (err, data) => {
      if(err) {
        res.statusCode = 500;
        res.json({error: err, url: req.url, body: req.body});
      } else{
        resolve(data)
      }
    })
  });

  // adminユーザー作成
  if(req.body.adminIDs.length) {
    const adminMaxID = await getMaxID('AttendanceAppUserGroupAdminTable-dev')

    var requests = req.body.adminIDs.map((id, index) => (
      {
        PutRequest: {
          Item: {
            id: (adminMaxID + index + 1),
            group_id: (groupMaxID + 1),
            user_id: id
          }
        }
      }
    ))
    var params = {
      RequestItems: {
        'AttendanceAppUserGroupAdminTable-dev': requests
      }
    }
    dynamodb.batchWrite(params, (err, data) => {
      if(err) {
        res.statusCode = 500;
        res.json({error: err, url: req.url, body: req.body, params: params});
      } else{
        // res.json({success: 'post call succeed!', url: req.url, data: data})
      }
    })
  }

  // generalユーザー作成
  if(req.body.generalIDs.length) {
    const generalMaxID = await getMaxID('AttendanceAppUserGroupGeneralTable-dev')

    var requests = req.body.generalIDs.map((id, index) => (
      {
        PutRequest: {
          Item: {
            id: (generalMaxID + index + 1),
            group_id: (groupMaxID + 1),
            user_id: id
          }
        }
      }
    ))
    var params = {
      RequestItems: {
        'AttendanceAppUserGroupGeneralTable-dev': requests
      }
    }
    dynamodb.batchWrite(params, (err, data) => {
      if(err) {
        res.statusCode = 500;
        res.json({error: err, url: req.url, body: req.body, params: params});
      } else{
        // res.json({success: 'post call succeed!', url: req.url, data: data})
      }
    })
  }

  res.json({ message: 'group created' })
});

/************************************
* HTTP put method
*************************************/
app.put(path + hashKeyPath, async function(req, res) {
  // group更新
  let putItemParams = {
    TableName: tableName,
    Item: {
      id: parseInt(req.params.id),
      name: req.body.name
    }
  }
  await new Promise((resolve, reject) => {
    dynamodb.put(putItemParams, (err, data) => {
      if(err) {
        res.statusCode = 500;
        res.json({error: err, url: req.url, body: req.body});
      } else{
        resolve(data)
      }
    })
  });

  // adminユーザー作成
  if(req.body.addedAdminIDs.length) {
    const adminMaxID = await getMaxID('AttendanceAppUserGroupAdminTable-dev')

    var requests = req.body.addedAdminIDs.map((id, index) => (
      {
        PutRequest: {
          Item: {
            id: (adminMaxID + index + 1),
            group_id: parseInt(req.params.id),
            user_id: id
          }
        }
      }
    ))
    var params = {
      RequestItems: {
        'AttendanceAppUserGroupAdminTable-dev': requests
      }
    }
    dynamodb.batchWrite(params, (err, data) => {
      if(err) {
        res.statusCode = 500;
        res.json({error: err, url: req.url, body: req.body, params: params});
      } else{
        // res.json({success: 'post call succeed!', url: req.url, data: data})
      }
    })
  }

  // generalユーザー作成
  if(req.body.addedGeneralIDs.length) {
    const generalMaxID = await getMaxID('AttendanceAppUserGroupGeneralTable-dev')

    var requests = req.body.addedGeneralIDs.map((id, index) => (
      {
        PutRequest: {
          Item: {
            id: (generalMaxID + index + 1),
            group_id: parseInt(req.params.id),
            user_id: id
          }
        }
      }
    ))
    var params = {
      RequestItems: {
        'AttendanceAppUserGroupGeneralTable-dev': requests
      }
    }
    dynamodb.batchWrite(params, (err, data) => {
      if(err) {
        res.statusCode = 500;
        res.json({error: err, url: req.url, body: req.body, params: params});
      } else{
        // res.json({success: 'post call succeed!', url: req.url, data: data})
      }
    })
  }

  // adminユーザー削除
  if(req.body.deletedAdminIDs.length) {
    var params = {
      TableName: 'AttendanceAppUserGroupAdminTable-dev',
      IndexName: 'group_id',
      KeyConditionExpression: "group_id = :groupID",
      ExpressionAttributeValues: {
        ":groupID": parseInt(req.params.id)
      }
    }
    var relations = await new Promise((resolve, reject) => {
      dynamodb.query(params, (err, data) => {
        if(err) {
          res.statusCode = 500
          res.json({error: 'Could not load UserGroupAdmins: ' + err.message})
        } else {
          resolve(data.Items)
        }
      })
    })

    relations.forEach(relation => {
      if(req.body.deletedAdminIDs.includes(relation.user_id)) {
        var params = {
          TableName: 'AttendanceAppUserGroupAdminTable-dev',
          Key: {
            id: relation.id
          }
        }
        dynamodb.delete(params, (err, data) => {
          if(err) {
            res.statusCode = 500
            res.json({erroor: 'Could not delete UserGroupAdmins: ' + err.message})
          }
        })
      }
    })
  }

  // generalユーザー削除
  if(req.body.deletedGeneralIDs.length) {
    var params = {
      TableName: 'AttendanceAppUserGroupGeneralTable-dev',
      IndexName: 'group_id',
      KeyConditionExpression: "group_id = :groupID",
      ExpressionAttributeValues: {
        ":groupID": parseInt(req.params.id)
      }
    }
    var relations = await new Promise((resolve, reject) => {
      dynamodb.query(params, (err, data) => {
        if(err) {
          res.statusCode = 500
          res.json({error: 'Could not load UserGroupGenerals: ' + err.message})
        } else {
          resolve(data.Items)
        }
      })
    })

    relations.forEach(relation => {
      if(req.body.deletedGeneralIDs.includes(relation.user_id)) {
        var params = {
          TableName: 'AttendanceAppUserGroupGeneralTable-dev',
          Key: {
            id: relation.id
          }
        }
        dynamodb.delete(params, (err, data) => {
          if(err) {
            res.statusCode = 500
            res.json({erroor: 'Could not delete UserGroupGenerals: ' + err.message})
          }
        })
      }
    })
  }

  res.json({message: 'delete completed!'})
})

const getMaxID = async (tableName) => {
  const params = {
    TableName: tableName
  }
  const items = await new Promise((resolve, reject) => {
    dynamodb.scan(params, (err, data) => {
      if(err) {
        reject({error: 'Could not scan items: ' + err.message});
      } else {
        resolve(data.Items);
      }
    })
  })
  const IDs = items.map(i => i.id)
  const maxID = Math.max.apply(null, IDs)

  return maxID
}
module.exports = app
