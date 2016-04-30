'use strict'
import _ from 'lodash'
import axios from 'axios'
import React from 'react'
import {render} from 'react-dom'
import Webcam from 'react-webcam'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

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

const Header = React.createClass({
  render() {
    return <header>
			<section className="container">
				<h1>Board Eye</h1>
				<p>A deep learning based line-of-sight detector</p>
			</section>
		</header>
  }
})

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
              <button style={style.controlButton} className='button' onClick={this.classify}>PREDICT</button>
              <button style={style.controlButton} className='button button-outline' onClick={this.classify}>Learn TRUE</button>
              <button style={style.controlButton} className='button button-outline' onClick={this.classify}>Learn FALSE</button>
            </div>
          </div>

          <div className='column column-60'>
            <h5>Prediction Result</h5>
            <blockquote>{this.state.apiResult.prediction}</blockquote>

            <h5>Feed CSV</h5>
            <blockquote style={style.feedCSV}>
              {this.state.apiResult.feedCSV}
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  },

  classify() {
    const base64Image = this.refs.webcam.getScreenshot().split(',')[1]
    axios.post('/api/classify', {base64Image}).then((res) => {
      console.debug(res.data.prediction)
      this.setState({apiResult: res.data})
    })
    .catch(console.error)
  }
})

render(<App/>, document.getElementById('contents'))
