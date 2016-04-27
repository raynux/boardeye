#!/usr/bin/env node
'use strict'
const _ = require('lodash')
const fs = require('fs')
const axios = require('axios')
const imageSnap = require('imagesnapjs')

const argv = require('yargs')
        .usage('Usage: $0 [-t or -f]')
        .example('$0', 'capture "true" image')
        .example('$0 -f', 'capture "false" image')
        .boolean('f')
        .alias('f', 'false')
        .argv

const config = require('./config')

const VISION_API_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate'
const now = Date.now()

const captureImage = () => {
  return new Promise((resolve, reject) => {
    const fileName = `${config.images}/${now}.jpg`
    console.error('Capturing ...')
    imageSnap.capture(fileName, {cliflags: ''}, (err) => {
      if(err) { return reject(err) }
      resolve(Buffer(fs.readFileSync(fileName)).toString('base64'))
    })
  })
}

captureImage()
.then((base64Image) => {
  return {
    image: {content: base64Image},
    features: [{
      type: 'FACE_DETECTION',
      maxResults: 10
    }]
  }
})
.then((requestBody) => {
  console.error('Calling Vision API ...')
  return axios({
    method: 'post',
    url: VISION_API_ENDPOINT,
    params: {key: process.env.GOOGLE_API_KEY},
    data: {requests: requestBody}
  })
})
.then((res) => {
  console.log(JSON.stringify(res.data, null, 2))
  const saveFileDir = argv.f ? config.falseResults : config.trueResults
  fs.writeFile(`${saveFileDir}/${now}.json`, JSON.stringify(res.data, null, 2))
})
.catch((err) => {
  console.error(JSON.stringify(err, null, 2))
})
