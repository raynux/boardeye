#!/usr/bin/env node
'use strict'
const _ = require('lodash')
const fs = require('fs')
const glob = require('glob')
const json2csv = require('json2csv')

const config = require('./config')

const recordGen = (anno) => {
  const fl = {
    FACE_BP:                    anno.fdBoundingPoly.vertices,
    LEFT_EYE:                   _.find(anno.landmarks, {type: 'LEFT_EYE'}).position,
    RIGHT_EYE:                  _.find(anno.landmarks, {type: 'RIGHT_EYE'}).position,
    MIDPOINT_BETWEEN_EYES:      _.find(anno.landmarks, {type: 'MIDPOINT_BETWEEN_EYES'}).position,
    LEFT_EYE_TOP_BOUNDARY:      _.find(anno.landmarks, {type: 'LEFT_EYE_TOP_BOUNDARY'}).position,
    LEFT_EYE_RIGHT_CORNER:      _.find(anno.landmarks, {type: 'LEFT_EYE_RIGHT_CORNER'}).position,
    LEFT_EYE_BOTTOM_BOUNDARY:   _.find(anno.landmarks, {type: 'LEFT_EYE_BOTTOM_BOUNDARY'}).position,
    LEFT_EYE_LEFT_CORNER:       _.find(anno.landmarks, {type: 'LEFT_EYE_LEFT_CORNER'}).position,
    LEFT_EYE_PUPIL:             _.find(anno.landmarks, {type: 'LEFT_EYE_PUPIL'}).position,
    RIGHT_EYE_TOP_BOUNDARY:     _.find(anno.landmarks, {type: 'RIGHT_EYE_TOP_BOUNDARY'}).position,
    RIGHT_EYE_RIGHT_CORNER:     _.find(anno.landmarks, {type: 'RIGHT_EYE_RIGHT_CORNER'}).position,
    RIGHT_EYE_BOTTOM_BOUNDARY:  _.find(anno.landmarks, {type: 'RIGHT_EYE_BOTTOM_BOUNDARY'}).position,
    RIGHT_EYE_LEFT_CORNER:      _.find(anno.landmarks, {type: 'RIGHT_EYE_LEFT_CORNER'}).position,
    RIGHT_EYE_PUPIL:            _.find(anno.landmarks, {type: 'RIGHT_EYE_PUPIL'}).position,
    FOREHEAD_GLABELLA:          _.find(anno.landmarks, {type: 'FOREHEAD_GLABELLA'}).position,
  }

  return {
    FACE_BP1_X: fl.FACE_BP[0].x,
    FACE_BP1_Y: fl.FACE_BP[0].y,
    FACE_BP2_X: fl.FACE_BP[1].x,
    FACE_BP2_Y: fl.FACE_BP[1].y,
    FACE_BP3_X: fl.FACE_BP[2].x,
    FACE_BP3_Y: fl.FACE_BP[2].y,
    FACE_BP4_X: fl.FACE_BP[3].x,
    FACE_BP4_Y: fl.FACE_BP[3].y,
    LEFT_EYE_X: fl.LEFT_EYE.x,
    LEFT_EYE_Y: fl.LEFT_EYE.y,
    LEFT_EYE_Z: fl.LEFT_EYE.z,
    RIGHT_EYE_X: fl.RIGHT_EYE.x,
    RIGHT_EYE_Y: fl.RIGHT_EYE.y,
    RIGHT_EYE_Z: fl.RIGHT_EYE.z,
    MIDPOINT_BETWEEN_EYES_X: fl.MIDPOINT_BETWEEN_EYES.x,
    MIDPOINT_BETWEEN_EYES_Y: fl.MIDPOINT_BETWEEN_EYES.y,
    MIDPOINT_BETWEEN_EYES_Z: fl.MIDPOINT_BETWEEN_EYES.z,
    LEFT_EYE_TOP_BOUNDARY_X: fl.LEFT_EYE_TOP_BOUNDARY.x,
    LEFT_EYE_TOP_BOUNDARY_Y: fl.LEFT_EYE_TOP_BOUNDARY.y,
    LEFT_EYE_TOP_BOUNDARY_Z: fl.LEFT_EYE_TOP_BOUNDARY.z,
    LEFT_EYE_RIGHT_CORNER_X: fl.LEFT_EYE_RIGHT_CORNER.x,
    LEFT_EYE_RIGHT_CORNER_Y: fl.LEFT_EYE_RIGHT_CORNER.y,
    LEFT_EYE_RIGHT_CORNER_Z: fl.LEFT_EYE_RIGHT_CORNER.z,
    LEFT_EYE_BOTTOM_BOUNDARY_X: fl.LEFT_EYE_BOTTOM_BOUNDARY.x,
    LEFT_EYE_BOTTOM_BOUNDARY_Y: fl.LEFT_EYE_BOTTOM_BOUNDARY.y,
    LEFT_EYE_BOTTOM_BOUNDARY_Z: fl.LEFT_EYE_BOTTOM_BOUNDARY.z,
    LEFT_EYE_LEFT_CORNER_X: fl.LEFT_EYE_LEFT_CORNER.x,
    LEFT_EYE_LEFT_CORNER_Y: fl.LEFT_EYE_LEFT_CORNER.y,
    LEFT_EYE_LEFT_CORNER_Z: fl.LEFT_EYE_LEFT_CORNER.z,
    LEFT_EYE_PUPIL_X: fl.LEFT_EYE_PUPIL.x,
    LEFT_EYE_PUPIL_Y: fl.LEFT_EYE_PUPIL.y,
    LEFT_EYE_PUPIL_Z: fl.LEFT_EYE_PUPIL.z,
    RIGHT_EYE_TOP_BOUNDARY_X: fl.RIGHT_EYE_TOP_BOUNDARY.x,
    RIGHT_EYE_TOP_BOUNDARY_Y: fl.RIGHT_EYE_TOP_BOUNDARY.y,
    RIGHT_EYE_TOP_BOUNDARY_Z: fl.RIGHT_EYE_TOP_BOUNDARY.z,
    RIGHT_EYE_RIGHT_CORNER_X: fl.RIGHT_EYE_RIGHT_CORNER.x,
    RIGHT_EYE_RIGHT_CORNER_Y: fl.RIGHT_EYE_RIGHT_CORNER.y,
    RIGHT_EYE_RIGHT_CORNER_Z: fl.RIGHT_EYE_RIGHT_CORNER.z,
    RIGHT_EYE_BOTTOM_BOUNDARY_X: fl.RIGHT_EYE_BOTTOM_BOUNDARY.x,
    RIGHT_EYE_BOTTOM_BOUNDARY_Y: fl.RIGHT_EYE_BOTTOM_BOUNDARY.y,
    RIGHT_EYE_BOTTOM_BOUNDARY_Z: fl.RIGHT_EYE_BOTTOM_BOUNDARY.z,
    RIGHT_EYE_LEFT_CORNER_X: fl.RIGHT_EYE_LEFT_CORNER.x,
    RIGHT_EYE_LEFT_CORNER_Y: fl.RIGHT_EYE_LEFT_CORNER.y,
    RIGHT_EYE_LEFT_CORNER_Z: fl.RIGHT_EYE_LEFT_CORNER.z,
    RIGHT_EYE_PUPIL_X: fl.RIGHT_EYE_PUPIL.x,
    RIGHT_EYE_PUPIL_Y: fl.RIGHT_EYE_PUPIL.y,
    RIGHT_EYE_PUPIL_Z: fl.RIGHT_EYE_PUPIL.z,
    FOREHEAD_GLABELLA_X: fl.FOREHEAD_GLABELLA.x,
    FOREHEAD_GLABELLA_Y: fl.FOREHEAD_GLABELLA.y,
    FOREHEAD_GLABELLA_Z: fl.FOREHEAD_GLABELLA.z,
    ROLL_ANGLE: anno.rollAngle,
    PAN_ANGLE: anno.panAngle,
    TILT_ANGLE: anno.tiltAngle
  }
}

glob(`${config.results}/*.json`, (err, fileNames) => {
  if(err){ return console.error(err) }

  const flatData = _.map(fileNames, (fileName) => {
    const data = _.at(JSON.parse(fs.readFileSync(fileName)), 'responses[0].faceAnnotations[0]')[0]
    if(!data) { return }
    return recordGen(data)
  })

  json2csv({data: flatData, fields: Object.keys(flatData[0])}, (err, csv) => {
    if(err) { return console.error(err) }
    console.log(csv)
  })
})
