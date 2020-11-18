import React from 'react';
import errorLink from '../../errorLink.png';

const CommonErrorMessage = (props) => {
  const propData = props;
  return (
    <div>
      {propData.hideImage === 'NO' ? (
        <div>
          <span style={{ display: 'block' }}>
            <img src={errorLink} alt="Error" />
          </span>
          <span className="errorMessagespan">{propData.message}</span>
        </div>
      ) : (
        <div className={propData.centerAlign === '' ? 'setPadding ' : ' setPadding  center'}>
          <span>{propData.Errorval === '' ? <>{propData.message}</> : <span className="errorFont">{propData.Errorval}</span>}</span>
        </div>
      )}
    </div>
  );
};
export default CommonErrorMessage;
