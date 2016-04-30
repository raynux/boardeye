'use strict'
import _ from 'lodash'
import axios from 'axios'
import React from 'react'
import {render} from 'react-dom'
import Webcam from 'react-webcam'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import Header from './components/Header'

const style = {
  feedCSV: {
    wordWrap: 'break-word'
  },
  actualWebcamWrap: {
    visibility: 'hidden',
    height: 0
  },
  controlButton: {
    marginRight: 4
  }
}

const App = React.createClass({
  getInitialState() {
    return {apiResult: {}}
  },

  render() {
    return <div>
      <Header />

      <div className='container'>
        <div className="row">
          <div className='column column-40'>
            <div>
              <Webcam audio={false} width={400} height={300} />
              <div style={style.actualWebcamWrap}>
                <Webcam ref='webcam' audio={false} width={1280} height={720} />
              </div>
            </div>
            <div>
              <button style={style.controlButton} className='button' onClick={this.classify}>Predict</button>
              <button style={style.controlButton}
                      className='button button-outline'
                      onClick={() => {this.learn(1)}}>Learn True</button>
              <button style={style.controlButton}
                      className='button button-outline'
                      onClick={() => {this.learn(0)}}>Learn False</button>
            </div>

            Prediction : <code>{this.state.apiResult.prediction}</code>
          </div>

          <div className='column column-60'>
            <h5>Feed CSV</h5>
            <blockquote style={style.feedCSV}>
              {JSON.stringify(this.state.apiResult.feedCSV, null, 2)}
            </blockquote>
          </div>
        </div>

        <hr />

        <h5>Vision Result</h5>
        <pre><code>{JSON.stringify(this.state.apiResult.visionResult, null, 2)}</code></pre>
      </div>
    </div>
  },

  classify() {
    this.setState({apiResult: {}})  // clear

    const base64Image = this.refs.webcam.getScreenshot().split(',')[1]
    axios.post('/api/classify', {base64Image}).then((res) => {
      console.debug(res.data.prediction)
      this.setState({apiResult: res.data})
    })
    .catch(console.error)
  },

  learn(feedType) {
    const base64Image = this.refs.webcam.getScreenshot().split(',')[1]
    axios.post('/api/learn', {feedType, base64Image}).then((res) => {
      console.debug(res.data)
    })
    .catch(console.error)
  }
})

render(<App/>, document.getElementById('contents'))
