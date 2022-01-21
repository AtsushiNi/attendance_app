class User {
  constructor(dynamodb) {
    this.tableName = 'AttendanceAppUsersTable-dev'
    this.dynamodb = dynamodb
  }

  async scan() {
    const params = {
      TableName: this.tableName
    }
    const users = await new Promise((resolve, reject) => {
      this.dynamodb.scan(params, (err, data) => {
        if(err) {
          reject({error: 'Could not scan users: ' + err.message})
        } else {
          resolve(data.Items)
        }
      })
    })
    return users
  }

  async get(id) {
    const params = {
      TableName: this.tableName,
      Key: {
        id: id
      }
    }
    const user = await new Promise((resolve, reject) => {
      this.dynamodb.get(params, (err, data) => {
        if(err) {
          reject({error: 'Could not get user: ' + err.message})
        } else {
          resolve(data.Item)
        }
      })
    })
    return user
  }
}

module.exports = User