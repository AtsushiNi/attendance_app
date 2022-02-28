const AWS = require('aws-sdk')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var bodyParser = require('body-parser')
var express = require('express')
const useAttendance = require('./models/Attendance')
const useApplication = require('./moodels/Application')
const useGroup = require('./models/Group')
const useUser = require('./models/User')
const useReviewer = require('./models/Reviewer')

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

// models
const Attendance = new useAttendance(dynamodb)
const Application = new useApplication(dynamodb)
const Group = new useGroup(dynamodb)
const User = new useUser(dynamodb)
const Reviewer = new useReviewer(dynamodb)

app.get('/attendances', async function(req, res) {
  console.log(req.query.userID)
  const userID = parseInt(req.query.userID)
  const attendances = await scan()
  const myAttendances = attendances.filter(a => a.user_id === userID)

  res.json(myAttendances)
})

app.post('/attendances', async function(req, res) {
  const maxID = await getMaxID()
  try {
    const params = {
      TableName: 'AttendanceAppAttendancesTable-dev',
      Item: {
        id: (maxID + 1),
        start_at: (new Date(req.body.startAt)).getTime(),
        status: 'working',
        user_id: parseInt(req.body.userID)
      }
    }
    await new Promise((resolve, reject) => {
      dynamodb.put(params, (err, data) => {
        if(err) {
          reject({error: 'Could not create attendance: ' + err.message})
        } else {
          resolve(data)
        }
      })
    })
  } catch(error) {
    res.statusCode = 500
    res.json(error)
  }

  res.json({ message: 'attendance created' })
})

app.put('/attendances/end', async function(req, res) {
  const attendances = await scan()
  const myAttendances = attendances.filter(a => a.user_id === parseInt(req.body.userID))
  const working = myAttendances.find(a => a.status === 'working')

  const params = {
    TableName: 'AttendanceAppAttendancesTable-dev',
    Key: { id: working.id },
    UpdateExpression: 'set end_at = :endAt, #s = :status',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues:{ ':endAt': (new Date(req.body.endAt)).getTime(), ':status': 'finished' }
  }
  try {
    await new Promise((resolve, reject) => {
      dynamodb.update(params, (err, data) => {
        if(err) {
          reject({error: 'Could not update attendance: ' + err.message})
        } else {
          resolve(data)
        }
      })
    })
    res.json({ message: 'attendance updated' })
  } catch(error) {
    res.statusCode = 500
    res.json(error)
  }
})

app.post('/attendances/:id/apply', async function(req, res) {
  const id = parseInt(req.params.id)
  const userID = parseInt(req.body.userID)

  // update attendance
  await Attendance.updateStatus(id, 'unapproved')

  const attendance = await Attendance.get(id)

  // create application
  const createParams = {
    type: 'create',
    afterStartAt: attendance.start_at,
    afterEndAt: attendance.end_at,
    statusParam: 'unapproved',
    memo: ''
  }
  const applicationID = await Application.create(createParams)

  // create reviewers
  const groupIDs = await Group.listIDs(userID)
  const adminIDs = await User.listIDsByGroupIDs(groupIDs)
  await Reviewer.batchCreate(adminIDs, applicationID)
})

const getMaxID = async () => {
  const attendances = await scan()
  const IDs = attendances.map(i => i.id)
  const maxID = IDs.length? Math.max.apply(null, IDs) : 0

  return maxID
}

const scan = async () => {
  const params = {
    TableName: 'AttendanceAppAttendancesTable-dev'
  }
  const attendances = await new Promise((resolve, reject) => {
    dynamodb.scan(params, (err, data) => {
      if(err) {
        reject({error: 'Could not scan attendances: ' + err.message})
      } else {
        resolve(data.Items)
      }
    })
  })

  return attendances
}

module.exports = app
