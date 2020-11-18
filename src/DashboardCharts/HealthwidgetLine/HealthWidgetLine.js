import React, { Component } from 'react';
import C3Chart from 'react-c3js';
import 'c3/c3.css';

class HealthWidgetLine extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const data = {
      columns: [['Task Completion(%)', 20, 30, 50, 70, 40, 80, 90, 100]],
      type: 'line'
    };
    const axis = {
      y: {
        label: {
          text: 'Task Completion(%)',
          position: 'outer-middle'
        },
        type: 'category'
      },
      x: {
        label: {
          text: 'Timeline',
          position: 'outer-center'
        },
        type: 'category'
      }
    };
    return (
      <div className="chart-wrapper">
        <div>
          <h2>Health widget</h2>
          <C3Chart data={data} axis={axis} />
        </div>
      </div>
    );
  }
}

export default HealthWidgetLine;
