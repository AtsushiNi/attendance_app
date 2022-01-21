var aws = require('aws-sdk');
var dynamodb = new aws.DynamoDB.DocumentClient();
var tableName = 'AttendanceAppUsersTable-dev'

exports.handler = async (event, context, callback) => {
  const getMaxID = async () => {
    const scanParams = {
      TableName: tableName
    }
    const userIDs = await new Promise((resolve, reject) => {
      dynamodb.scan(scanParams, (err, data) => {
        if(err) {
          reject({error: 'Could not scan groups: ' + err.message})
        } else {
          resolve(data.Items.map(user => user.id))
        }
      })
    })
    const maxID = Math.max.apply(null, userIDs)
    return maxID
  }

  const maxID = await getMaxID()
  const params = {
    TableName: tableName,
    Item: {
      id: (maxID + 1),
      e_mail: event.request.userAttributes.email,
      cognito_id: event.request.userAttributes.sub
    }
  }
  dynamodb.put(params, (err, data) => {
    if(err) {
      console.log({error: 'Could not scan groups: ' + err.message})
    }
  })

  callback(null, event);
};
