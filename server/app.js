'use strict'
const _           = require('lodash')
const fs          = require('fs')
const exec        = require('child-process-promise').exec
const express     = require('express')
const morgan      = require('morgan')
const bodyParser  = require('body-parser')
const compression = require('compression')
const axios       = require('axios')
const json2csv    = require('json2csv')

const flatAnnotation = require('../lib/flat_annotation')
const visionRequest = require('../lib/vision_request')


if(!process.env.GOOGLE_API_KEY) {
  console.error('GOOGLE_API_KEY must be defined as an env value')
  process.exit(1)
}

const app = express()
app.use(morgan('short'))
app.use(bodyParser.json({extended: '100mb'}))
app.use(bodyParser.urlencoded({extended: '10mb'}))
app.use(compression())
app.use(express.static('public'))
app.use('/milligram', express.static('node_modules/milligram/dist/'))

const json2csvPromise = (param) => {
  return new Promise((resolve, reject) => {
    json2csv(param, (err, csv) => {
      if(err) { return reject(err) }
      resolve(csv)
    })
  })
}

// Route
app.post('/api/learn', (req, res) => {
  if(!_.includes([0, 1], req.body.feedType)) {
    return res.status(500).json({message: 'bad feedType'})
  }

  visionRequest(req.body.base64Image)
  .then((result) => {
    const fileName = `data/${req.body.feedType}/${Date.now()}.json`
    fs.writeFileSync(fileName, JSON.stringify(result.data, null, 2))
    console.log(`wrote to ${fileName}`)
    res.json({message: 'ok', fileName})
  })
  .catch((err) => {
    console.error(err)
    res.status(500).json({message: err})
  })
})

app.post('/api/classify', (req, res) => {
  let visionResult = null
  let feedCSV = null

  visionRequest(req.body.base64Image)
  .then((result) => {
    visionResult = result.data
    const faceAnnotation = _.at(visionResult, 'responses[0].faceAnnotations[0]')[0]
    const flatData = flatAnnotation(faceAnnotation)
    return json2csvPromise({
      data: [flatData],
      fields: Object.keys(flatData),
      hasCSVColumnTitle: false
    })
  })
  .then((csv) => {
    feedCSV = csv
    return exec(`python ./predict.py ${csv}`)
  })
  .then((result) => {
    if(result.error) { return Promise.reject(result.error) }
    const output = JSON.parse(result.stdout)

    res.json({
      visionResult,
      feedCSV,
      prediction: output.prediction
    })
  })
  .catch((err) => {
    console.error(err)
    res.status(500).json({message: err})
  })
})

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// Error handler
app.use((err, req, res) => {
  console.log(err)
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: err
  })
})

module.exports = app
