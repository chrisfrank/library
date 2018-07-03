'use strict'

const airbrake = require('airbrake')
const log = require('../logger')
const {config} = require('../utils')

// error functions are special. They have to be attached directly to the app.
exports.airbrake = process.env.AIRBRAKE_PROJECT_ID
  ? initAirbrake().expressHandler()
  : (res, req, next) => next() // empty airbrake code

exports.errorPages = (err, req, res, next) => {
  const messages = {
    'Not found': 404,
    'Unauthorized': 403
  }

  const code = messages[err.message] || 500
  log.error(`Serving an error page for ${req.url}`, err)
  res.status(code).render(`errors/${code}`, {err, config})
}

function initAirbrake() {
  const client = airbrake.createClient(
    process.env.AIRBRAKE_PROJECT_ID,
    process.env.AIRBRAKE_API_KEY
  )

  client.addFilter((notice) => {
    // Don't report 404s to Airbrake
    if (notice.errors[0].message === 'Not found') {
      return null
    }

    return notice
  })

  return client
}

// generic error handler to return error pages to user
