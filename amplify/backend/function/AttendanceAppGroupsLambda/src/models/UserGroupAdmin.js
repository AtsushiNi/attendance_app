class UserGroupAdmin {
  constructor(dynamodb) {
    this.tableName = 'AttendanceAppUserGroupAdminTable-dev'
    this.dynamodb = dynamodb
  }

  async getUserIDsByGroupId(groupID) {
    const params = {
      TableName: this.tableName,
      IndexName: 'group_id',
      KeyConditionExpression: "group_id = :groupID",
      ExpressionAttributeValues: {
        ":groupID": groupID
      }
    }
    const userIDs = await new Promise((resolve, reject) => {
      this.dynamodb.query(params, (err, data) => {
        if(err) {
          reject({error: ('Could not query adminGroups: ' + err.message)})
        } else {
          resolve(data.Items.map(relation => relation.group_id))
        }
      })
    })
    return userIDs
  }
}

module.exports = UserGroupAdmin
