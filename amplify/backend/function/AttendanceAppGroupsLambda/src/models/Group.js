class Group {
  constructor(dynamodb) {
    this.tableName = 'AttendanceAppGroupsTable-dev'
    this.dynamodb = dynamodb
  }

  async scan() {
    const params = {
      TableName: this.tableName
    }
    const groups = await new Promise((resolve, reject) => {
      this.dynamodb.scan(params, (err, data) => {
        if(err) {
          reject({error: 'Could not scan users: ' + err.message})
        } else {
          resolve(data.Items)
        }
      })
    })
    return groups
  }

  async get(id) {
    const params = {
      TableName: this.tableName,
      Key: {
        id: id
      }
    }
    const group = await new Promise((resolve, reject) => {
      this.dynamodb.get(params, (err, data) => {
        if(err) {
          reject({error: 'Could not get user: ' + err.message})
        } else {
          resolve(data.Item)
        }
      })
    })
    return group
  }
}

module.exports = Group
