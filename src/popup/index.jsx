import browser from 'webextension-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export const LintTable = ({
  text,
  lints,
  contextLength,
}) => {
  const { length } = text;
  return (
    <table>
      <tbody>
        {lints.map((lint) => {
          const lintStart = lint.index;
          const lintEnd = lintStart + lint.offset;
          const contextStart = Math.max(lintStart - contextLength, 0);
          const contextEnd = Math.min(lintEnd + contextLength, length);
          const moreContextStart = contextStart !== 0;
          const moreContextEnd = contextEnd !== length;
          return (
            <tr>
              <td>
                {moreContextStart
                  ? `…${text.slice(contextStart + 1, lintStart)}`
                  : text.slice(contextStart, lintStart)}
                <b>{text.slice(lintStart, lintEnd)}</b>
                {moreContextEnd
                  ? `${text.slice(lintEnd, contextEnd - 1)}…`
                  : text.slice(lintEnd, contextEnd)}
              </td>
              <td className="lint-reason">{lint.reason}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
LintTable.propTypes = {
  text: PropTypes.string.isRequired,
  lints: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  contextLength: PropTypes.number,
};
LintTable.defaultProps = {
  contextLength: 5,
};

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

ReactDOM.render(<Popup />, document.querySelector('#popup'));
