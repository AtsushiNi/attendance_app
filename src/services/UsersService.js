import { API } from 'aws-amplify'

const apiName = 'AttendanceAppUsersApi'
const path = '/users'

class UsersService {

  async getUsers() {
    const response = await API.get(apiName, path, {})

    return response.Items
  }
}

export default new UsersService()
