#!/usr/bin/env node
'use strict'
const _ = require('lodash')
const fs = require('fs')
const glob = require('glob')
const json2csv = require('json2csv')

const flatAnnotation = require('./lib/flat_annotation')

const argv = require('yargs')
        .usage('Usage: $0 [-d directory]')
        .example('$0 -d DIR', 'generate CSV based on results in DIR')
        .option('d', {
          alias : 'directory',
          describe: 'Directory to load Vision API result',
          type: 'string',
          nargs: 1,
          demand: true,
          requiresArg: true
        })
        .help('help')
        .argv

const config = require('./config')

glob(`${argv.d}/*.json`, (err, fileNames) => {
  if(err){ return console.error(err) }

  const flatData = _(fileNames)
    .map((fileName) => {
      const data = _.at(JSON.parse(fs.readFileSync(fileName)), 'responses[0].faceAnnotations[0]')[0]
      if(!data) { return }
      return flatAnnotation(data)
    })
    .filter((rec) => { return !_.values(rec).includes(undefined) })
    .filter((rec) => { return !_.values(rec).includes(null) })
    .filter((rec) => { return !_.values(rec).includes(NaN) })
    .value()

  json2csv({data: flatData, fields: Object.keys(flatData[0])}, (err, csv) => {
    if(err) { return console.error(err) }
    console.log(csv)
  })
})
