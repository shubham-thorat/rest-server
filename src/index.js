const express = require('express')
const app = express()
const helper = require('./helper')
const RedisClient = require('./redis/redisClient')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/', (req, res) => {
  res.status(200).json({
    "SUCCESS": "OK"
  })
})



app.post('/', (req, res) => {
  const data = req.body
  const startTime = Date.now()
  // console.log("data", data)
  const payload = req.body
  let serverlogfileName = payload.serverlogfileName ?? 'output_server.log'
  RedisClient.setKey(payload.key, payload.value).then(response => {
    const endTime = Date.now();
    Count.increment()
    const timeRequired = endTime - startTime;
    helper.writeToFile(timeRequired, Count.getCount(), serverlogfileName)
    res.status(200).json({
      msg: 'Redis key set success',
      TimeDiffServer: (endTime - startTime) / 1000,
      "request count": Count.getCount(),
      "reponse_redis": response
    })

  }).catch(error => {
    const timeRequired = getTime(startTime);
    res.status(500).json({
      msg: 'Redis key set failure',
      TimeDiffServer: `${timeRequired}s`,
      "Error": error
    })
  })
})

const port = process.env.PORT || 8000
app.listen(port, () => {
  console.log(`running on port ${port}`)
})