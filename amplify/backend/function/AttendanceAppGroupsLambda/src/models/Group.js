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
          reject({error: 'Could not scan groups: ' + err.message})
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
          reject({error: 'Could not get group: ' + err.message})
        } else {
          resolve(data.Item)
        }
      })
    })
    return group
  }

  async create(name) {
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
        name: name
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

  async update(id, updateParams) {
    const params = {
      TableName: this.tableName,
      Item: {
        id: id,
        name: updateParams.name
      }
    }
    await new Promise((resolve, reject) => {
      this.dynamodb.put(params, (err, data) => {
        if(err) {
          reject({error: 'Could not update group: ' + err.message})
        } else{
          resolve(data)
        }
      })
    })
    return({message: 'completed update group'})
  }

  async getMaxID() {
    const groups = await this.scan()
    const IDs = groups.map(i => i.id)
    const maxID = Math.max.apply(null, IDs)

    return maxID
  }
}

module.exports = Group
