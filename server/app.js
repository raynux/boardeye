'use strict'
const _          = require('lodash')
const express    = require('express')
const morgan     = require('morgan')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json({extended: '100mb'}))
app.use(bodyParser.urlencoded({extended: '10mb'}))
app.use(express.static('./public'))

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
