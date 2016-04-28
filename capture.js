#!/usr/bin/env node
'use strict'
const _ = require('lodash')
const fs = require('fs')
const axios = require('axios')
const imageSnap = require('imagesnapjs')

const argv = require('yargs')
        .usage('Usage: $0 [-d directory]')
        .example('$0 -d DIR', 'capture an image then store result in DIR')
        .option('d', {
          alias : 'directory',
          describe: 'Directory to store Vision API result',
          type: 'string',
          nargs: 1,
          demand: true,
          requiresArg: true
        })
        .help('help')
        .argv

const config = require('./config')

const VISION_API_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate'
const now = Date.now()

const captureImage = () => {
  return new Promise((resolve, reject) => {
    const fileName = `${config.images}/${now}.jpg`
    console.error('Capturing ...')
    imageSnap.capture(fileName, {cliflags: '-w 2'}, (err) => {
      if(err) { return reject(err) }
      console.log(`Saving the image as ${fileName}`)
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
  console.log('Calling Vision API ...')
  return axios({
    method: 'post',
    url: VISION_API_ENDPOINT,
    params: {key: process.env.GOOGLE_API_KEY},
    data: {requests: requestBody}
  })
})
.then((res) => {
  const fileName = `${argv.d}/${now}.json`
  fs.writeFileSync(fileName, JSON.stringify(res.data, null, 2))
  console.log(`Saving the result as ${fileName}`)
})
.catch((err) => {
  console.error(JSON.stringify(err, null, 2))
})
