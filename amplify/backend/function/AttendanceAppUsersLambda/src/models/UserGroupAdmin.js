class UserGroupAdmin {
  constructor(dynamodb) {
    this.tableName = 'AttendanceAppUserGroupAdminTable-dev'
    this.dynamodb = dynamodb
  }

  async getGroupIDsByUserId(userID) {
    const params = {
      TableName: this.tableName,
      IndexName: 'user_id',
      KeyConditionExpression: "user_id = :userID",
      ExpressionAttributeValues: {
        ":userID": userID
      }
    }
    const groupIDs = await new Promise((resolve, reject) => {
      this.dynamodb.query(params, (err, data) => {
        if(err) {
          reject({error: ('Could not query adminGroups: ' + err.message)})
        } else {
          resolve(data.Items.map(relation => relation.group_id))
        }
      })
    })
    return groupIDs
  }
}

module.exports = UserGroupAdmin
