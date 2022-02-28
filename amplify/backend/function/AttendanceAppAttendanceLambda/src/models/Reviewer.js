class Reviewer {
  constructor(dynamodb) {
    this.tableName = 'AttendanceAppReviewersTable-dev'
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

  async batchCreate(userIDs, applicationID) {
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
            application_id: applicationID,
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
          reject({error: 'Could not create reviewers: ' + err.message})
        } else {
          resolve(data)
        }
      })
    })
    return({message: 'completed create reviewers'})
  }

  async getMaxID() {
    const groups = await this.scan()
    const IDs = groups.map(i => i.id)
    const maxID = IDs.length? Math.max.apply(null, IDs) : 0

    return maxID
  }
}

module.exports = Reviewer
