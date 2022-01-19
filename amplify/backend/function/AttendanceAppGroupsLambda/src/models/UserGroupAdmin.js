class UserGroupAdmin {
  constructor(dynamodb) {
    this.tableName = 'AttendanceAppUserGroupAdminTable-dev'
    this.dynamodb = dynamodb
  }

  async scan() {
    const params = {
      TableName: this.tableName
    }
    const groups = await new Promise((resolve, reject) => {
      this.dynamodb.scan(params, (err, data) => {
        if(err) {
          reject({error: 'Could not scan UserGroupAdmins: ' + err.message})
        } else {
          resolve(data.Items)
        }
      })
    })
    return groups
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
          reject({error: ('Could not query adminGroups: ' + err.message)})
        } else {
          resolve(data.Items)
        }
      })
    })
    return relations
  }

  async batchCreate(groupID, userIDs) {
    let maxID
    try {
      maxID = await this.getMaxID()
    } catch (error) {
      throw error
    }
    const requests = userIDs.map((id, index) => (
      {
        PutRequest: {
          Item: {
            id: (maxID + index + 1),
            group_id: groupID,
            user_id: id
          }
        }
      }
    ))
    const params = {
      RequestItems: {
        [this.tableName]: requests
      }
    }
    await new Promise((resolve, reject) => {
      this.dynamodb.batchWrite(params, (err, data) => {
        if(err) {
          reject({error: 'Could not create UserGroupAdmins: ' + err.message})
        } else {
          resolve(data)
        }
      })
    })
    return({message: 'completed create UserGroupAdmins'})
  }

  async delete(id) {
    const params = {
      TableName: this.tableName,
      Key: {
        id: id
      }
    }
    await new Promise((resolve, reject) => {
      this.dynamodb.delete(params, (err, data) => {
        if(err) {
          reject({error: 'Could not delete UserGroupAdmin: ' + err.message})
        } else {
          resolve(data)
        }
      })
    })
    return({message: 'completed delete UserGroupAdmins'})
  }

  async getMaxID() {
    const groups = await this.scan()
    const IDs = groups.map(i => i.id)
    const maxID = Math.max.apply(null, IDs)

    return maxID
  }
}

module.exports = UserGroupAdmin
