import React, { Component } from 'react';
import C3Chart from 'react-c3js';
import 'c3/c3.css';
import saveSvgAsPng from 'save-svg-as-png';
import './TimelinePrediction.css';
import moment from 'moment';
import CommonDateFunction from '../../serviceCall/CommonDateFunction';

class TimeLinePrediction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      effortSpend: [],
      effortRemaining: [],
      dates: [],
      weekends: [],
      showErrorMessage: '',
      storyPoints: ''
    };
    this.commonDateFunc = new CommonDateFunction();
  }

  componentDidMount() {
    const propsData = this.props;
    const stateData = this.state;
    const storyFll = propsData.burnDownData.userBornDownData.storyPoints;
    const startDateArray = [];
    const endDateArray = [];
    const result = [];
    let startDate;
    let endDate;
    if (propsData.burnDownData.selectedSprint.length > 0) {
      propsData.burnDownData.selectedSprint.forEach((sprint) => {
        result.push(propsData.burnDownData.sprintDetails.filter((spr) => spr.name === sprint)[0]);
      });
      propsData.burnDownData.sprintDetails = result;
    }
    // eslint-disable-next-line max-len
    if (
      propsData.burnDownData.PIrelaseDetails.startDate &&
      propsData.burnDownData.PIrelaseDetails.releaseDate &&
      propsData.burnDownData.sprintDetailsLength === propsData.burnDownData.selectedSprint.length
    ) {
      startDate = propsData.burnDownData.PIrelaseDetails.startDate;
      endDate = propsData.burnDownData.PIrelaseDetails.releaseDate;
    } else {
      propsData.burnDownData.sprintDetails.forEach((element) => {
        if (element.startDate) startDateArray.push(element.startDate);
        if (element.endDate) endDateArray.push(element.endDate);
      });
      if (startDateArray.length > 0 && endDateArray.length > 0) {
        startDate = this.commonDateFunc.getMinDate(startDateArray);
        endDate = this.commonDateFunc.getMaxDate(endDateArray);
      } else if (startDate === undefined || endDate === undefined) {
        startDate = propsData.burnDownData.PIrelaseDetails.startDate;
        endDate = propsData.burnDownData.PIrelaseDetails.releaseDate;
      } else {
        this.setState({
          showErrorMessage: 'No proper start and end date secified'
        });
      }
    }
    if (stateData.showErrorMessage === '') {
      // const remdays = this.commonDateFunc.getNoofDaysBetween(moment(), endDate);
      // this.setState({ remainDays: remdays < 0 ? 0 : remdays });
      let reducedTime = storyFll;
      let efforTime = 0;
      let effortotal = 0;
      let getCurrDateIndex = 0;
      const dates = this.commonDateFunc.getDaysBetweenDates(moment(startDate), moment(endDate));
      const effortRemaining = new Array(dates.length).fill(storyFll);
      const effortSpend = new Array(dates.length).fill(0);
      const weekends = new Array(dates.length).fill(0);
      dates.forEach((date, index) => {
        const weekendsCal = this.commonDateFunc.getDayofWeek(date);
        weekends[index] = weekendsCal === 0 || weekendsCal === 6 ? propsData.burnDownData.userBornDownData.storyPoints : 0;
        if (this.commonDateFunc.compareDates(moment(), date)) {
          getCurrDateIndex = index + 1;
        }
        propsData.burnDownData.userBornDownData.statPoints.forEach((values) => {
          if (this.commonDateFunc.compareDates(date, values.date)) {
            const effCal = values.storypointsSpent;
            efforTime = efforTime === 0 ? effCal : efforTime + effCal;
            reducedTime -= effCal;
            effortSpend[index] = efforTime;
            if (reducedTime < 0) {
              effortRemaining[index] = 0;
            } else {
              effortRemaining[index] = reducedTime;
            }
            effortotal = effortSpend[index];
          } else {
            if (reducedTime < 0) {
              effortRemaining[index] = 0;
            } else {
              effortRemaining[index] = reducedTime;
            }
            effortSpend[index] = efforTime;
          }
        });
      });
      if (getCurrDateIndex !== 0) {
        effortSpend.fill(null, getCurrDateIndex, effortSpend.length);
        effortRemaining.fill(null, getCurrDateIndex, effortRemaining.length);
      }
      weekends.forEach((element, index) => {
        if (element !== 0) {
          weekends[index] = propsData.burnDownData.userBornDownData.storyPoints > effortotal ? propsData.burnDownData.userBornDownData.storyPoints : effortotal;
        }
      });
      this.setState({
        effortSpend,
        effortRemaining,
        weekends,
        dates,
        storyPoints: propsData.burnDownData.userBornDownData.storyPoints
      });
    }
  }

  download = () => {
    const nodeList = document.getElementById('timeline').querySelector('svg').querySelectorAll('.c3-chart .c3-chart-line path');
    const nodeList2 = document.getElementById('timeline').querySelector('svg').querySelectorAll('.c3-axis path');
    const nodeList3 = document.getElementById('timeline').querySelector('svg').querySelectorAll('.c3 .tick line');
    const lineGraph = Array.from(nodeList);
    const cmbine = Array.from(nodeList2).concat(Array.from(nodeList3));
    /* eslint-disable no-param-reassign */
    lineGraph.forEach(element => {
      element.style.fill = "none";
    });
    /* eslint-disable no-param-reassign */
    document.getElementById('timeline').querySelector('svg > g:nth-last-of-type(1)').style.transform = 'translate(10px, 10px)';
    document.getElementById('timeline').querySelector('svg').style.font = '10px sans-serif';
    document.getElementById('timeline').querySelector('svg').style.backgroundColor = '#fff';
    /* eslint-disable no-param-reassign */
    cmbine.forEach(element => {
      element.style.fill = 'none';
      element.style.stroke = 'black';
    });
    /* eslint-disable no-param-reassign */
    const svg = document.getElementById('timeline').getElementsByTagName('svg')[0];
    saveSvgAsPng.saveSvgAsPng(svg, 'StoryPoints Burndown Chart.png');
  };

  render() {
    const stateVal = this.state;
    const story = stateVal.storyPoints;
    const data = {
      x: 'x',
      columns: [
        ['x', ...stateVal.dates],
        ['StoryPoints Remaining', ...stateVal.effortRemaining],
        ['StoryPoints Completed', ...stateVal.effortSpend],
        ['Weekends', ...stateVal.weekends]
      ],
      type: 'line',
      colors: {
        'StoryPoints Remaining': 'rgba(100, 84, 192)',
        'StoryPoints Completed': 'rgba(255, 171, 0)',
        Weekends: 'rgba(255, 235, 230)'
      },
      types: {
        data3: 'line',
        Weekends: 'bar'
      },
      legend: {
        show: true
      }
    };
    const axis = {
      y: {
        max: story,
        label: {
          text: 'StoryPoints',
          position: 'outer-middle'
        },
        type: 'category'
      },
      x: {
        type: 'timeseries',
        tick: {
          // count: stateVal.dates.length > 10 ? 15 : 10,
          format: '%e %b %y'
        },
        label: {
          text: 'Days',
          position: 'outer-center'
        }
      }
    };
    const bar = {
      width: {
        ratio: 1 // this makes bar width 50% of length between ticks
      }
    };
    const grid = {
      y: {
        lines: [{ value: story, text: 'Total capacity', class: 'capacity-line' }]
      }
    };
    const padding = {
      top: 30,
      right: 20
    };

    return (
      <div>
        <div className="download-img">
          <div role="button" onClick={this.download} onKeyDown={this.download} tabIndex={0}>
            <img src={require("../../images/download.png")} alt="download" />
            <span>Download Image</span>
          </div>
        </div>
        <div className="firstspin" id="timeline">
          <C3Chart data={data} axis={axis} grid={grid} bar={bar} padding={padding} />
        </div>
      </div>
    );
  }
}
export default TimeLinePrediction;
