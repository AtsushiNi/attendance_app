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
}

export default new GroupsService()
