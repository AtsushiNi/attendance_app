class Group {
  constructor(dynamodb) {
    this.tableName = 'AttendanceAppGroupsTable-dev'
    this.dynamodb = dynamodb
  }

  async batchGet(ids) {
    const groups = await Promise.all(ids.map(async id => {
      const params = {
        TableName: this.tableName,
        Key: {
          id: id
        }
      }
      return await new Promise((resolve, reject) => {
        this.dynamodb.get(params, (err, data) => {
          if(err) {
            reject({error: 'Could not get Group: ' + err.message})
          } else {
            resolve(data.Item)
          }
        })
      })
    }))
    return groups
  }
}

module.exports = Group
