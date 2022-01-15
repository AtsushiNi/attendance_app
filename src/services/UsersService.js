import { API } from 'aws-amplify'

const apiName = 'AttendanceAppUsersApi'

class UsersService {

  async getUsers() {
    const path = '/users'

    const response = await API.get(apiName, path, {})

    return response.Items
  }

  async getUser(id) {
    const path = '/users/' + id
    const response = await API.get(apiName, path, {})

    return response[0]
  }
}

export default new UsersService()
