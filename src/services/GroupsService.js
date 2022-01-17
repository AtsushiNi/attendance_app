import { API } from 'aws-amplify'

const apiName = 'AttendanceAppUsersApi'

class GroupsService {

  async getGroups() {
    const path = '/groups'

    const response = await API.get(apiName, path, {})

    return response
  }

  async getGroup(id) {
    const path = '/groups/' + id
    const response = await API.get(apiName, path, {})

    return response
  }

  async create(params) {
    const path = '/groups'
    const init = {
      body: params
    }
    const response = await API.post(apiName, path, init)

    return response
  }
}

export default new GroupsService()
