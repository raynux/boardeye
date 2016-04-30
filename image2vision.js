#!/usr/bin/env node
'use strict'
const _ = require('lodash')
const fs = require('fs')
const glob = require('glob')
const json2csv = require('json2csv')

const flatAnnotation = require('./lib/flat_annotation')
const visionRequest = require('./lib/vision_request')

const argv = require('yargs')
        .usage('Usage: $0 [-d directory]')
        .example('$0 -s SOURCE_DIR -d DIST_DIR', 'Store Vision API results')
        .option('d', {
          alias : 'dist',
          describe: 'Directory to load image',
          type: 'string',
          nargs: 1,
          demand: true,
          requiresArg: true
        })
        .option('s', {
          alias : 'source',
          describe: 'Directory to store Vision API result',
          type: 'string',
          nargs: 1,
          demand: true,
          requiresArg: true
        })
        .help('help')
        .argv

glob(`${argv.s}/*`, (err, fileNames) => {
  if(err){ return console.error(err) }

  const timerId = setInterval(() => {
    if(_.isEmpty(fileNames)) {
      console.log(fileNames.length)

      console.log('stopping')
      clearInterval(timerId)
      return
    }

    const fileName = fileNames.shift()
    const base64Image = Buffer(fs.readFileSync(fileName)).toString('base64')

    visionRequest(base64Image)
    .then((visionResult) => {
      const jsonFile = `${argv.d}/${Date.now()}.json`
      console.log(jsonFile)
      fs.writeFileSync(jsonFile, JSON.stringify(visionResult.data, null, 2))
    })
    .catch(console.error)
  }, 500)
})
