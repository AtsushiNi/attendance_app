class Attendance {
  constructor(dynamodb) {
    this.tableName = 'AttendanceAppAttendancesTable-dev'
    this.dynamodb = dynamodb
  }

  async scan() {
    const params = {
      TableName: this.tableName
    }
    const groups = await new Promise((resolve, reject) => {
      this.dynamodb.scan(params, (err, data) => {
        if(err) {
          reject({error: 'Could not scan attendances: ' + err.message})
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
          reject({error: 'Could not get attendance: ' + err.message})
        } else {
          resolve(data.Item)
        }
      })
    })
    return group
  }

  async updateStatus(id, status) {
    const params = {
      TableName: this.tableName,
      Key: { id: id },
      UpdateExpression: 'set #s = :status, updated_at = :now',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues:{ ':status': status, ':now': (new Date()).getTime() }
    }
    await new Promise((resolve, reject) => {
      this.dynamodb.update(params, (err, data) => {
        if(err) {
          reject({error: 'Could not update group: ' + err.message})
        } else{
          resolve(data)
        }
      })
    })
    return ({ message: 'attendance updated'})
  }

  async getMaxID() {
    const groups = await this.scan()
    const IDs = groups.map(i => i.id)
    const maxID = IDs.length? Math.max.apply(null, IDs) : 0

    return maxID
  }
}

module.exports = Attendance