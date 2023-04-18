const express = require('express')
const cors = require('cors')
const fs = require('fs')

const {
  ATTENDANCE_FILE_NAME,
  ATTENDANCE_SEED_FILE_NAME,
  STUDENTS_SEED_FILE_NAME,
} = require('./constants/fileNames')

const { getCurrentMonthDayYear } = require('./utils/date')

const app = express()
const port = 3001

const studentsSeedData = require(`./data/${STUDENTS_SEED_FILE_NAME}.json`)
const attendanceSeedData = require(`./data/${ATTENDANCE_SEED_FILE_NAME}.json`)

let attendanceData = attendanceSeedData

app.use(cors())

app.use((req, res, next) => {
  console.log(
    `Incoming request to: ${req.path} with params: ${JSON.stringify(req.query)}`
  )
  next()
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/students', (req, res) => {
  res.send(studentsSeedData)
})

app.get('/attendance', (req, res) => {
  res.send(attendanceData)
})

app.post('/attendance', (req, res) => {
  const studentId = req.query.studentId

  const student = studentsSeedData.find(({ id }) => id === studentId)

  if (!student) return res.status(404).end('No user found')

  const currentDate = getCurrentMonthDayYear()

  // Is the student already added to the attendance
  const studentAlreadyRegistered =
    attendanceData?.[currentDate]?.includes(student.id) !== undefined

  if (studentAlreadyRegistered) return res.end(JSON.stringify(attendanceData))
  // TODO - clean this up
  attendanceData[currentDate] = [
    ...(attendanceData[currentDate] ?? []),
    student.id,
  ]

  res.end(JSON.stringify(attendanceData))
})

app.listen(port, () => {
  console.log(`Attendance app listening on port ${port}`)
})

const saveDataInterval = () => {
  setInterval(() => {
    console.log('Saving data...')

    const dataSize = Object.keys(attendanceData).length
    const attendanceDataJSON = JSON.stringify(attendanceData)

    fs.writeFile(
      `./data/${ATTENDANCE_FILE_NAME}.json`,
      attendanceDataJSON,
      'utf8',
      (error, data) => {
        if (error) {
          console.error(error)
        } else {
          console.log('Data saved! Array size: ', dataSize)
        }
      }
    )
  }, 1000 * 60 * 1) // every minute
}

const getAttendanceData = () => {
  fs.readFile(`./data/${ATTENDANCE_FILE_NAME}.json`, 'utf8', (error, data) => {
    if (error) {
      console.log('No saved data found')
      return
    }

    const parsedData = JSON.parse(data)
    console.log(parsedData)
    attendanceData = {
      ...parsedData,
    }

    console.log(
      'Attendance data recovered from file, Array size: ',
      Object.keys(parsedData).length
    )
  })
}

const setUp = () => {
  getAttendanceData()
  saveDataInterval()
}

setUp()
