import React from 'react';
import { Line } from 'rc-progress';
import chartloader from '../../chartloader.png';

const CommonChartLoader = () => {
  return (
    <div className="chartLoder">
      <div>
        <img src={chartloader} alt="Paris" width="300" height="300" />
      </div>
      <span className="plstext">Please Wait ...</span>
      <br />
      <span className="bodyMessage">while loading information</span>
      <br />
      <div className="progressBar">
        <Line percent="30" strokeWidth="4" strokeColor="#0052CC" />
      </div>
    </div>
  );
};
export default CommonChartLoader;
