class Group {
  constructor(dynamodb) {
    this.groupTableName = 'AttendanceAppGroupsTable-dev'
    this.generalTableName = 'AttendanceAppUserGroupGeneralTable-dev'
    this.dynamodb = dynamodb
  }

  async listIDs(userID) {
    // get general group IDs
    const params = {
      TableName: this.generalTableName,
      IndexName: 'user_id',
      KeyConditionExpression: "user_id = :userID",
      ExpressionAttributeValues: {
        ":userID": userID
      }
    }
    const relations = await new Promise((resolve, reject) => {
      this.dynamodb.query(params, (err, data) => {
        if(err) {
          reject({error: ('Could not query generalGroups: ' + err.message)})
        } else {
          resolve(data.Items)
        }
      })
    })
    const groupIDs = relations.map(r => r.group_id)

    return groupIDs
  }
}

module.exports = Group