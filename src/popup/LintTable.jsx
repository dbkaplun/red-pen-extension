import React from 'react';
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

export default LintTable;
