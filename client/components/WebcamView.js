import React from 'react'
import axios from 'axios'
import Webcam from 'react-webcam'
import EventEmitterMixin from 'react-event-emitter-mixin'

const style = {
  actualWebcamWrap: {
    visibility: 'hidden',
    height: 0
  },
  controlButton: {
    marginRight: 4
  }
}

module.exports = React.createClass({
  mixins: [EventEmitterMixin],

  getBase64Image() { return this.refs.webcam.getScreenshot().split(',')[1] },

  componentWillMount() {
    this.eventEmitter('on', 'beginClassify', () => {
      const base64Image = this.getBase64Image()
      console.log(base64Image)
      axios.post('/api/classify', {base64Image}).then((res) => {
        console.debug(res.data.prediction)
        this.eventEmitter('emit', 'doneClassify', res.data)
      })
      .catch(console.error)
    })

    this.eventEmitter('on', 'beginStoreImage', (feedType) => {
      const base64Image = this.getBase64Image()
      axios.post('/api/learn', {feedType, base64Image}).then((res) => {
        console.debug(res.data)
        this.eventEmitter('emit', 'doneStoreImage', res.data)
      })
      .catch(console.error)
    })
  },

  render() {
    return <div>
      <Webcam audio={false} width={this.props.width} height={this.props.height} />
      <div style={style.actualWebcamWrap}>
        <Webcam ref='webcam' audio={false} width={1280} height={720} />
      </div>

      <div>
        <button style={style.controlButton} className='button'
                onClick={() => {
                  this.eventEmitter('emit', 'beginClassify')
                }}>Predict</button>
        <button style={style.controlButton}
                className='button button-outline'
                onClick={() => {
                  this.eventEmitter('emit', 'beginStoreImage', 1)
                }}>Learn True</button>
        <button style={style.controlButton}
                className='button button-outline'
                onClick={() => {
                  this.eventEmitter('emit', 'beginStoreImage', 0)
                }}>Learn False</button>
      </div>
    </div>
  }
})
