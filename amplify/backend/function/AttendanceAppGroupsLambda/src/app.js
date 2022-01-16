const AWS = require('aws-sdk')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var bodyParser = require('body-parser')
var express = require('express')

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
app.get(path, function(req, res) {
  var params = {
    TableName: tableName
  };

  dynamodb.scan(params, (err, data) => {
    if(err) {
      res.statusCode = 500;
      res.json({error: 'Could not scan items: ' + err.message});
    } else {
      if (data.Items) {
        res.json(data.Items);
      } else {
        res.json(data) ;
      }
    }
  })
})

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

 app.get(path + hashKeyPath, async function(req, res) {
  var params = {};

  params[partitionKeyName] = req.params[partitionKeyName];
  try {
    params[partitionKeyName] = convertUrlType(req.params[partitionKeyName], partitionKeyType);
  } catch(err) {
    res.statusCode = 500;
    res.json({error: 'Wrong column type ' + err});
  }

  let getItemParams = {
    TableName: tableName,
    Key: params
  }

  const group = await new Promise((resolve, reject) => {
    dynamodb.get(getItemParams,(err, data) => {
      if(err) {
        res.statusCode = 500;
        res.json({error: 'Could not load Group: ' + err.message});
      } else {
        resolve(data.Item)
      }
    })
  });

  // get admin users
  var condition = {
    TableName: 'AttendanceAppUserGroupAdminTable-dev',
    IndexName: 'group_id',
    KeyConditionExpression: "group_id = :groupID",
    ExpressionAttributeValues: {
      ":groupID": parseInt(req.params['id'])
    }
  }
  const adminUserIDs = await new Promise((resolve, reject) => {
    dynamodb.query(condition, (err, data) => {
      if(err) {
        res.statusCode = 500
        res.json({error: 'Could not load UserGroupAdmins: ' + err.message});
      } else {
        if (data.Items) {
          resolve(data.Items.map(item => item['user_id']))
        } else {
          resolve([])
        }
      }
    })
  })

  let adminUsers = []
  if (adminUserIDs) {
    adminUsers = await Promise.all(adminUserIDs.map(async id => {
      const getAdminUserCondition = {
        TableName: 'AttendanceAppUsersTable-dev',
        Key: {
          "id": id
        }
      }
      return await new Promise((resolve, reject) => {
        dynamodb.get(getAdminUserCondition, (err, data) => {
          if(err) {
            res.statusCode = 500
            res.json({error: 'Could not load AdminUser: ' + err.message})
          } else {
            if (data.Item) {
              resolve(data.Item)
            }
          }
        })
      })
    }))
  }

  // get general users
  var condition = {
    TableName: 'AttendanceAppUserGroupGeneralTable-dev',
    IndexName: 'group_id',
    KeyConditionExpression: "group_id = :groupID",
    ExpressionAttributeValues: {
      ":groupID": parseInt(req.params['id'])
    }
  }
  const generalUserIDs = await new Promise((resolve, reject) => {
    dynamodb.query(condition, (err, data) => {
      if(err) {
        res.statusCode = 500
        res.json({error: 'Could not load UserGroupGenrals: ' + err.message});
      } else {
        if (data.Items) {
          resolve(data.Items.map(item => item['user_id']))
        } else {
          resolve([])
        }
      }
    })
  })

  let generalUsers = []
  if (generalUserIDs) {
    generalUsers = await Promise.all(generalUserIDs.map(async id => {
      const getGeneralUserCondition = {
        TableName: 'AttendanceAppUsersTable-dev',
        Key: {
          "id": id
        }
      }
      return await new Promise((resolve, reject) => {
        dynamodb.get(getGeneralUserCondition, (err, data) => {
          if(err) {
            res.statusCode = 500
            res.json({error: 'Could not load GeneralUser: ' + err.message})
          } else {
            if (data.Item) {
              resolve(data.Item)
            }
          }
        })
      })
    }))
  }

  group['adminUsers'] = adminUsers
  group['generalUsers'] = generalUsers
  res.json(group)
});

module.exports = app
