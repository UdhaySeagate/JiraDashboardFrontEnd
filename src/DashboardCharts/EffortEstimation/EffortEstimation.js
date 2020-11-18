import React, { Component } from 'react';
import C3Chart from 'react-c3js';
import 'c3/c3.css';
import './EffortEstimation.css';

/**
 * Description: Class used to control filter section of effort estimatin gadget
 * Author: Baskar.V.P
 * Date: 12-06-2020
 */
class EfforEstimation extends Component {
  constructor() {
    super();
    this.state = {};
  }
  /**
   * Method : render
   * Deescription: Default react method to render html with content
   *                 render data from API response
   * created date: 12-06-2020
   * author : Baskar.V.p
   */

  render() {
    const data = {
      x: 'x',
      columns: [
        ['x', 1, 2, 3, 4, 5, 6],
        ['Spill Over', 30, 40, 70, 60, 15, 25],
        ['Planned', 50, 60, 10, 40, 15, 25],
        ['Completed', 50, 20, 10, 40, 15, 25],
        ['Not Completed', 50, 20, 10, 40, 15, 25]
      ],
      colors: {
        'Spill Over': '#ebecf0',
        Planned: '#57d9a2',
        Completed: '#0000ff',
        'Not Completed': '#0000ff'
      },
      groups: [
        ['SpillOver', 'Planned'],
        ['Completed', 'NotCompleted']
      ],
      type: 'bar',
      labels: false
    };
    const axis = {
      y: {
        label: {
          text: 'Efforts in hrs',
          position: 'outer-middle'
        },
        type: 'category'
      },
      x: {
        label: {
          text: 'Days',
          position: 'outer-center'
        },
        type: 'category'
      }
    };
    return (
      <div className="chart-wrapper">
        <div>
          <h2>Effort Estimation Variance</h2>
          <C3Chart data={data} axis={axis} />
        </div>
      </div>
    );
  }
}

export default EfforEstimation;
