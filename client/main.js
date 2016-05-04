'use strict'
import _ from 'lodash'
import axios from 'axios'
import React from 'react'
import {render} from 'react-dom'
import EventEmitterMixin from 'react-event-emitter-mixin'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import Header from './components/Header'
import WebcamView from './components/WebcamView'

const style = {
  feedCSV: {
    wordWrap: 'break-word'
  }
}

const App = React.createClass({
  mixins: [EventEmitterMixin],

  getInitialState() {
    return {apiResult: {}}
  },

  componentWillMount() {
    this.eventEmitter('on', 'beginClassify', () => {
      this.setState({apiResult: {}})  // clear
    })

    this.eventEmitter('on', 'doneClassify', (result) => {
      this.setState({apiResult: result})
    })
  },

  render() {
    return <div>
      <Header />

      <div className='container'>
        <div className="row">
          <div className='column column-40'>
            <WebcamView width={400} height={300} />

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
  }
})

render(<App />, document.getElementById('contents'))
