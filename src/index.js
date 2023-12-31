const express = require('express')
const app = express()
const RedisClient = require('./redis/redisClient')
const client = require('./statsD')
const cors = require('cors')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "*"
}))

class Count {
  static request_count = 0;
  static setInitial() {
    this.request_count = 0;
  }
  static increment() {
    this.request_count = this.request_count + 1
    return this.request_count
  }
  static getCount() {
    return this.request_count
  }
}

const getTime = (startTime) => {
  return (Date.now() - startTime) / 1000;
}


app.get('/health', (req, res) => {
  // console.log("HEALTH CHECK API CALLED")
  return res.status(200).json({
    "SUCCESS": "OK"
  })
})
app.get('/', (req, res) => {

  console.log("GET API CALLED")
  res.status(200).json({
    "SUCCESS": "OK"
  })
})



app.post('/', (req, res) => {
  const startTime = Date.now()
  client.timing('request_received', 1)
  const payload = req.body
  RedisClient.setKey(payload.key, payload.value).then(response => {
    const endTime = Date.now();
    // console.log("reach4")
    Count.increment()
    const timeRequired = endTime - startTime;

    client.timing('response_time', timeRequired)
    client.timing('request_end', 1)
    console.log('REQUEST END :', Count.getCount())

    res.status(200).json({
      msg: 'Redis key set success',
      TimeDiffServer: (endTime - startTime) / 1000,
      "request count": Count.getCount(),
      "reponse_redis": response
    })

  }).catch(error => {
    const timeRequired = getTime(startTime);
    console.log("ERROR : ", error)
    res.status(500).json({
      msg: 'Redis key set failure',
      TimeDiffServer: `${timeRequired}s`,
      "Error": error
    })
  })
})

const port = 8000
app.listen(port, () => {
  console.log(`running on port ${port}`)
})