const axios = require('axios')

const VISION_API_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate'

module.exports = (base64Image) => {
  return axios({
    method: 'post',
    url: VISION_API_ENDPOINT,
    params: {key: process.env.GOOGLE_API_KEY},
    data: {
      requests: {
        image: {content: base64Image},
        features: [{
          type: 'FACE_DETECTION',
          maxResults: 10
        }]
      }
    }
  })
}
