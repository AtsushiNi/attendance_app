class UserGroupGeneral {
  constructor(dynamodb) {
    this.tableName = 'AttendanceAppUserGroupGeneralTable-dev'
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
          reject({error: ('Could not query generalGroups: ' + err.message)})
        } else {
          resolve(data.Items.map(relation => relation.group_id))
        }
      })
    })
    return groupIDs
  }

  async getUserIDsByGroupId(groupID) {
    let relations
    try {
      relations = await this.queryByGroupId(groupID)
    } catch(error) {
      throw(error)
    }
    return relations.map(relation => relation.user_id)
  }

  async queryByGroupId(groupID) {
    const params = {
      TableName: this.tableName,
      IndexName: 'group_id',
      KeyConditionExpression: "group_id = :groupID",
      ExpressionAttributeValues: {
        ":groupID": groupID
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
    return relations
  }
}

module.exports = UserGroupGeneral
