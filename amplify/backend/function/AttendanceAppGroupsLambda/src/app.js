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
