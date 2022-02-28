class Application {
  constructor(dynamodb) {
    this.tableName = 'AttendanceAppApplicationsTable-dev'
    this.dynamodb = dynamodb
  }

  async scan() {
    const params = {
      TableName: this.tableName
    }
    const groups = await new Promise((resolve, reject) => {
      this.dynamodb.scan(params, (err, data) => {
        if(err) {
          reject({error: 'Could not scan applications: ' + err.message})
        } else {
          resolve(data.Items)
        }
      })
    })
    return groups
  }

  async create(props) {
    const { type, afterStartAt, afterEndAt, statusParam, memo } = props
    let maxID
    try {
      maxID = await this.getMaxID()
    } catch (error) {
      throw error
    }
    const params = {
      TableName: this.tableName,
      Item: {
        id: (maxID + 1),
        type: type,
        after_start_at: afterStartAt,
        after_end_at: afterEndAt,
        created_at: (new Date()).getTime(),
        status: statusParam,
        memo: memo
      }
    }
    await new Promise((resolve, reject) => {
      this.dynamodb.put(params, (err, data) => {
        if(err) {
          reject({error: 'Could not create group: ' + err.message})
        } else{
          resolve(data)
        }
      })
    })
    return (maxID + 1)
  }

  async getMaxID() {
    const groups = await this.scan()
    const IDs = groups.map(i => i.id)
    const maxID = IDs.length? Math.max.apply(null, IDs) : 0

    return maxID
  }
}

module.exports = Application