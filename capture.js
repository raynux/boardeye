#!/usr/bin/env node
'use strict'
const _ = require('lodash')
const fs = require('fs')
const axios = require('axios')
const imageSnap = require('imagesnapjs')
const json2csv = require('json2csv')
const flatAnnotation = require('./lib/flat_annotation')

const argv = require('yargs')
        .usage('Usage: $0 [-d directory]')
        .example('$0', 'capture an image then classify')
        .example('$0 -d DIR', 'capture an image then store result in DIR')
        .option('d', {
          alias : 'directory',
          describe: 'Directory to store Vision API result',
          type: 'string',
          nargs: 1,
          demand: false,
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
      if(!argv.d) { console.log(`Saving the image as ${fileName}`) }
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
  // store mode
  if(argv.d) {
    const fileName = `${argv.d}/${now}.json`
    fs.writeFileSync(fileName, JSON.stringify(res.data, null, 2))
    console.log(`Saving the result as ${fileName}`)
    return
  }

  // console ouput mode
  fs.unlinkSync(`${config.images}/${now}.jpg`)

  const faceAnnotation = _.at(res.data, 'responses[0].faceAnnotations[0]')[0]
  const flatData = flatAnnotation(faceAnnotation)
  json2csv({data: [flatData],
            fields: Object.keys(flatData),
            hasCSVColumnTitle: false}, (err, csv) => {
    if(err) { return console.error(err) }
    console.log(csv)
  })
})
.catch((err) => {
  console.error(err)
})
