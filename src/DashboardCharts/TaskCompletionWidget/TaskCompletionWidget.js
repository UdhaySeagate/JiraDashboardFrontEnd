import React, { Component } from 'react';
import C3Chart from 'react-c3js';
import 'c3/c3.css';

/**
 * Description: Class used to control filter section of task complemettion gadgte
 * Author: Baskar.V.P
 * Date: 12-06-2020
 */
class TaskCompletionWidget extends Component {
  constructor() {
    super();
    this.state = {};
  }

  /**
   * Method : render
   * Deescription: Default react method to render html with content
   * created date: 12-06-2020
   */
  render() {
    const data = {
      x: 'x',
      columns: [
        ['x', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        ['Completed', 10, 20, 40, 50, 17, 25, 30, 50, 35, 56, 76],
        ['Incompleted', 10, 20, 40, 50, 17, 25, 30, 50, 35, 56, 76],
        ['Weekends', 0, 0, 0, 60, 60, 0, 0, 0, 60, 60, 0]
      ],
      colors: {
        Completed: '#998dd9',
        Incompleted: '#ffc400',
        Weekends: '#f4f5f7'
      },
      groups: [['Completed', 'Incompleted']],
      type: 'bar'
    };
    return (
      <div className="chart-wrapper">
        <div>
          <h2>Task Completion Widget</h2>
          {/* <div className="firstspin">
                    <span className="textcommon spillover"><span className="colorclass red"></span>  Spill Over</span>
                    <span className="textcommon planned"><span className="colorclass blue"></span> Planned</span>
                </div>
                <div className="firstspin">
                    <span className="textcommon completed"><span className="colorclass green"></span> Completed</span>
                    <span className="textcommon ncompleted"><span className="colorclass grey"></span> Not Completed</span>
                </div> */}
          <C3Chart data={data} />
        </div>
      </div>
    );
  }
}

export default TaskCompletionWidget;
