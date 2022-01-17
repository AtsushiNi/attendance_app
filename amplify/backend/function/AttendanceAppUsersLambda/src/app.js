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

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "AttendanceAppUsersTable";
if(process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "id";
const partitionKeyType = "N";
const sortKeyName = "";
const sortKeyType = "";
const hasSortKey = sortKeyName !== "";
const path = "/users";
const UNAUTH = 'UNAUTH';
const hashKeyPath = '/:' + partitionKeyName;
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : '';
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

// convert url string param to expected Type
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

app.get(path + hashKeyPath, function(req, res) {
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

  dynamodb.get(getItemParams,(err, data) => {
    if(err) {
      res.statusCode = 500;
      res.json({error: 'Could not load items: ' + err.message});
    } else {
      if (data.Item) {
        res.json(data.Item);
      } else {
        res.json(data) ;
      }
    }
  });
});

/********************************
 * HTTP Get method for groups in single user
 ********************************/
app.get(path+'/:id/groups', async function(req, res) {
  // get admin grooups
  var condition = {
    TableName: 'AttendanceAppUserGroupAdminTable-dev',
    IndexName: 'user_id',
    KeyConditionExpression: "user_id = :userID",
    ExpressionAttributeValues: {
      ":userID": parseInt(req.params['id'])
    }
  }
  const adminGroupIDs = await new Promise((resolve, reject) => {
    dynamodb.query(condition, (err, data) => {
      if(err) {
        res.statusCode = 500
        res.json({error: 'Could not load AdminGroupIDs: ' + err.message})
      } else {
        if (data.Items) {
          resolve(data.Items.map(item => item['group_id']))
        } else {
          resolve([])
        }
      }
    })
  })

  let adminGroups = []
  if (adminGroupIDs) {
    adminGroups = await Promise.all(adminGroupIDs.map(async id => {
      const getAdminGroupCondition = {
        TableName: 'AttendanceAppGroupsTable-dev',
        Key: {
          "id": id
        }
      }
      return await new Promise((resolve, reject) => {
        dynamodb.get(getAdminGroupCondition, (err, data) => {
          if(err) {
            res.statusCode = 500
            res.json({error: 'Could not load AdminGroup: ' + err.message})
          } else {
            if (data.Item) {
              resolve(data.Item)
            }
          }
        })
      })
    }))
  }

  // get general grooups
  var condition = {
    TableName: 'AttendanceAppUserGroupGeneralTable-dev',
    IndexName: 'user_id',
    KeyConditionExpression: "user_id = :userID",
    ExpressionAttributeValues: {
      ":userID": parseInt(req.params['id'])
    }
  }
  const generalGroupIDs = await new Promise((resolve, reject) => {
    dynamodb.query(condition, (err, data) => {
      if(err) {
        res.statusCode = 500
        res.json({error: 'Could not load GeneralGroupIDs: ' + err.message})
      } else {
        if (data.Items) {
          resolve(data.Items.map(item => item['group_id']))
        } else {
          resolve([])
        }
      }
    })
  })

  let generalGroups = []
  if (generalGroupIDs) {
    generalGroups = await Promise.all(generalGroupIDs.map(async id => {
      const getGeneralGroupCondition = {
        TableName: 'AttendanceAppGroupsTable-dev',
        Key: {
          "id": id
        }
      }
      return await new Promise((resolve, reject) => {
        dynamodb.get(getGeneralGroupCondition, (err, data) => {
          if(err) {
            res.statusCode = 500
            res.json({error: 'Could not load GeneralGroup: ' + err.message})
          } else {
            if (data.Item) {
              resolve(data.Item)
            }
          }
        })
      })
    }))
  }

  res.json({adminGroups: adminGroups, generalGroups: generalGroups})
})

/************************************
* HTTP put method for insert object *
*************************************/

app.put(path, function(req, res) {

  if (userIdPresent) {
    req.body['userId'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: req.body
  }
  dynamodb.put(putItemParams, (err, data) => {
    if(err) {
      res.statusCode = 500;
      res.json({error: err, url: req.url, body: req.body});
    } else{
      res.json({success: 'put call succeed!', url: req.url, data: data})
    }
  });
});

/************************************
* HTTP post method for insert object *
*************************************/

app.post(path, function(req, res) {

  if (userIdPresent) {
    req.body['userId'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: req.body
  }
  dynamodb.put(putItemParams, (err, data) => {
    if(err) {
      res.statusCode = 500;
      res.json({error: err, url: req.url, body: req.body});
    } else{
      res.json({success: 'post call succeed!', url: req.url, data: data})
    }
  });
});

/**************************************
* HTTP remove method to delete object *
***************************************/

app.delete(path + '/object' + hashKeyPath + sortKeyPath, function(req, res) {
  var params = {};
  if (userIdPresent && req.apiGateway) {
    params[partitionKeyName] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  } else {
    params[partitionKeyName] = req.params[partitionKeyName];
     try {
      params[partitionKeyName] = convertUrlType(req.params[partitionKeyName], partitionKeyType);
    } catch(err) {
      res.statusCode = 500;
      res.json({error: 'Wrong column type ' + err});
    }
  }
  if (hasSortKey) {
    try {
      params[sortKeyName] = convertUrlType(req.params[sortKeyName], sortKeyType);
    } catch(err) {
      res.statusCode = 500;
      res.json({error: 'Wrong column type ' + err});
    }
  }

  let removeItemParams = {
    TableName: tableName,
    Key: params
  }
  dynamodb.delete(removeItemParams, (err, data)=> {
    if(err) {
      res.statusCode = 500;
      res.json({error: err, url: req.url});
    } else {
      res.json({url: req.url, data: data});
    }
  });
});
app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
