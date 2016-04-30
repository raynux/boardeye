'use strict'
const _ = require('lodash')
const cluster = require('cluster')
const numCPUs = require('os').cpus().length
const http = require('http')
const port = process.env.PORT || '3000'
const argv = require('yargs')
        .usage('Usage: $0 [-c]')
        .example('$0', 'run server as a single process')
        .example('$0 -c', 'run server as a cluster mode')
        .option('c', {
          alias : 'cluster',
          describe: 'cluster mode',
          type: 'boolean',
          nargs: 0,
          demand: false,
          requiresArg: false
        })
        .help('help')
        .argv

const runner = () => {
  const app = require('./app')
  const server = http.createServer(app)
  app.set('port', port)

  const onError = (error) => {
    if (error.syscall !== 'listen') { throw error }
    switch (error.code) {
      case 'EACCES':
        console.error(`${port} requires elevated privileges`)
        process.exit(1)
        break
      case 'EADDRINUSE':
        console.error(`${port} is already in use`)
        process.exit(1)
        break
      default:
        throw error
    }
  }

  server.on('error', onError)
  server.on('listening', () => {
    console.log(`Listening on ${server.address().port}`)
  })
  server.listen(port)
}

// Cluster mode or not
if(argv.c) {
  cluster.isMaster ? _.times(numCPUs, cluster.fork) : runner()
}
else {
  runner()
}
