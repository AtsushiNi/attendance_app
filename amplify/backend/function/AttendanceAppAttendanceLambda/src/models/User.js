class User {
  constructor(dynamodb) {
    this.userTableName = 'AttendanceAppUsersTable-dev'
    this.adminTableName = 'AttendanceAppUserGroupAdminTable-dev'
    this.dynamodb = dynamodb
  }

  async listByGroupIDs(groupIDs) {
    // get admin User IDs
    const adminRelations = await Promise.all(groupIDs.map(async id => {
      const params = {
        TableName: this.adminTableName,
        IndexName: 'group_id',
        KeyConditionExpression: "group_id = :groupID",
        ExpressionAttributeValues: {
          ":userID": id
        }
      }
      return await new Promise((resolve, reject) => {
        this.dynamodb.query(params, (err, data) => {
          if(err) {
            reject({error: 'Could not get admin: ' + err.message})
          } else {
            resolve(data.Items.map(i => i.user_id))
          }
        })
      })
    }))
    const userIDs = Array.from(new Set(adminRelations.flat()))

    return userIDs
  }
}

module.exports = User