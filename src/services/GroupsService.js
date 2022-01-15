import { API } from 'aws-amplify'

const apiName = 'AttendanceAppUsersApi'

class GroupsService {

  async getGroups() {
    const path = '/groups'

    const response = await API.get(apiName, path, {})

    return response.Items
  }

  async getGroup(id) {
    const path = '/groups/' + id
    const response = await API.get(apiName, path, {})

    return response[0]
  }
}

export default new GroupsService()
