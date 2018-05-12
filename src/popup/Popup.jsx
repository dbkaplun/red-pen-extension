import browser from 'webextension-polyfill';
import React from 'react';

import { LintTable } from './LintTable';

export default class Popup extends React.Component {
  constructor(...args) {
    super(...args);
    this.onPortMessage = this.onPortMessage.bind(this);
    this.state = { lintEvt: null };
  }

  componentDidMount() {
    this.port = browser.runtime.connect({ name: 'popup' });
    this.port.onMessage.addListener(this.onPortMessage);
  }

  componentWillUnmount() {
    this.port.disconnect();
  }

  onPortMessage(evt) {
    switch (evt.type) {
      case 'lint':
        this.setState({ lintEvt: evt });
        break;
      default:
        throw new Error(`unexpected evt type '${evt.type}'`);
    }
  }

  render() {
    const {
      text = '',
      lints = [],
    } = this.state.lintEvt || {};
    return (
      <div>
        <h1>Red Pen Extension</h1>
        {
          lints.length ? (
            <div>
              <p>
                <span role="img" aria-label="Pen and paper">📝</span> {lints.length} suggestion{lints.length !== 1 && 's'}:
              </p>
              <LintTable text={text} lints={lints} />
            </div>
          ) : (
            <blockquote>
              <p>Tact is the art of making a point without making an enemy.</p>
              <footer><cite>Isaac Newton</cite></footer>
            </blockquote>
          )
        }
      </div>
    );
  }
}
