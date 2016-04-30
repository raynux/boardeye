'use strict'
const _           = require('lodash')
const exec        = require('child-process-promise').exec
const express     = require('express')
const morgan      = require('morgan')
const bodyParser  = require('body-parser')
const compression = require('compression')
const axios       = require('axios')
const json2csv    = require('json2csv')

const flatAnnotation = require('../lib/flat_annotation')

const VISION_API_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate'

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
app.post('/api/classify', (req, res) => {
  let visionResult = null
  let feedCSV = null

  axios({
    method: 'post',
    url: VISION_API_ENDPOINT,
    params: {key: process.env.GOOGLE_API_KEY},
    data: {
      requests: {
        image: {content: req.body.base64Image},
        features: [{
          type: 'FACE_DETECTION',
          maxResults: 10
        }]
      }
    }
  })
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

    res.json({
      visionResult,
      feedCSV,
      prediction: _.flatten(JSON.parse(result.stdout))
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
