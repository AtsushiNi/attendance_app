import { API } from 'aws-amplify'

const apiName = 'AttendanceAppAtteandanchAPI'

class AttendanceService {
  async getAttendances(userID) {
    const path = '/attendances'
    const init = {
      queryStringParameters: {
        userID: userID
      }
    }
    const response = await API.get(apiName, path, init)

    return response
  }

  async startWork(time, userID) {
    const path = '/attendances'
    const init = {
      body: {
        startAt: time,
        userID: userID
      }
    }

    const response = await API.post(apiName, path, init)

    return response
  }

  async finishWork(time, userID) {
    const path = '/attendances/end'
    const init = {
      body: {
        endAt: time,
        userID: userID
      }
    }

    const response = await API.put(apiName, path, init)

    return response
  }
}

export default new AttendanceService()
