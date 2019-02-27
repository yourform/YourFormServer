const { google } = require('googleapis')
const express = require('express')
const bodyParser = require('body-parser')
const mongo = require('../mongo')
const predictRouter = express.Router()

predictRouter.use(bodyParser.json())

const project = 'flash-landing-229404'
const ccModel = 'cervical_cancer'
const ccVersion = 'cervical_cancer3'
const sModel = 'stroke'
const sVersion = 'stroke_v2'

function auth (callback) {
  google.auth.getApplicationDefault(function (err, authClient) {
    if (err) {
      return callback(err)
    }
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/cloud-platform'
      ])
    }
    callback(null, authClient)
  })
}

// Route the HTTP GET request
predictRouter.post('/predict/cervical-cancer', function (req, res) {
  console.log(JSON.stringify(req.body))
  var age = req.body.age
  var partners = req.body.partners
  var intercourse = req.body.intercourse
  var pregnancies = req.body.pregnancies
  var smokes = req.body.smokes
  var smokePacks = req.body.smokePacks
  var contraceptives = req.body.contraceptives
  var iud = req.body.iud
  var stds = req.body.stds
  var stdsNum = req.body.stdsNum
  var condyl = req.body.condyl
  var vCondyl = req.body.vCondyl
  var pid = req.body.pid
  var hiv = req.body.hiv
  var cCondyl = req.body.cCondyl
  var vpc = req.body.vpc
  var gHerpes = req.body.gHerpes
  var hepB = req.body.hepB
  var syphilis = req.body.syphilis
  var molCont = req.body.molCont
  var hpv = req.body.hpv
  var aids = req.body.aids

  auth(function (err, authClient) {
    if (err) {
      console.error(err)
    } else {
      mongo.insert(ccModel, req.body, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to complete request' })
        }
        var ml = google.ml({
          version: 'v1',
          auth: authClient
        })
        ml.projects.predict({
          name: `projects/${project}/models/${ccModel}/versions/${ccVersion}`,
          resource: {
            instances: [[age, partners, intercourse, pregnancies, smokes, smokePacks, contraceptives, iud, stds, stdsNum, condyl, vCondyl, pid, hiv, cCondyl, vpc, gHerpes, hepB, syphilis, molCont, hpv, aids]]
          }
        }, function (err, result) {
          if (err) {
            console.error('ERROR PRIORITY', err)
          }
          console.log('RES: ', JSON.stringify(result))
          if (result && result.data && result.data.predictions) {
            res.status(200).json(result.data.predictions[0])
          }
          return res.status(500).json({ message: 'Something went wrong.' })
        })
      })
    }
  })
})

// Route the HTTP GET request
predictRouter.post('/predict/stroke', function (req, res) {
  console.log(JSON.stringify(req.body))
  var age = req.body.age
  var gender = req.body.gender
  var hypertension = req.body.hypertension
  var heartDisease = req.body.heartDisease
  var everMarried = req.body.everMarried
  var workType = req.body.workType
  var residence = req.body.residence
  var hFeet = req.body.hFeet
  var hInches = req.body.hInches
  var wPounds = req.body.wPounds

  var inches = hFeet * 12 + hInches
  var bmi = Math.round(703 * wPounds / Math.pow(inches, 2))

  auth(function (err, authClient) {
    if (err) {
      console.error(err)
    } else {
      mongo.insert(sModel, req.body, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to complete request' })
        }
        var ml = google.ml({
          version: 'v1',
          auth: authClient
        })
        ml.projects.predict({
          name: `projects/${project}/models/${sModel}/versions/${sVersion}`,
          resource: {
            instances: [[age, gender, hypertension, heartDisease, everMarried, workType, residence, bmi]]
          }
        }, function (err, result) {
          if (err) {
            console.error('ERROR PRIORITY', err)
          }
          console.log('RES: ', JSON.stringify(result))
          if (result && result.data && result.data.predictions) {
            res.status(200).json(result.data.predictions[0])
          }
          return res.status(500).json({ message: 'Something went wrong.' })
        })
      })
    }
  })
})

module.exports = predictRouter
