import { API } from 'aws-amplify'

const apiName = 'AttendanceAppUsersApi'

class UsersService {
  async getUsers() {
    const path = '/users'

    const response = await API.get(apiName, path, {})

    return response
  }

  async getUser(id) {
    const path = '/users/' + id
    const response = await API.get(apiName, path, {})

    return response[0]
  }

  async getByEmail(email) {
    const path = '/users'
    const init = {
      queryStringParameters: {
        email: email
      }
    }
    const response = await API.get(apiName, path, init)

    return response
  }

  async getUserWithGroups(id) {
    const getUserPath = '/users/' + id
    const userResponse = await API.get(apiName, getUserPath, {})

    const getGroupsPath = '/users/' + id + '/groups'
    const groupsResponse = await API.get(apiName, getGroupsPath, {})

    return {...userResponse, ...groupsResponse}
  }
}

export default new UsersService()
