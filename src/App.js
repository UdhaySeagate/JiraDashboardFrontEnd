/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import './App.css';
import TimeLinePrediction from './DashboardCharts/TimelinePrediction/TimelinePrediction';
// import HealthWidgetLine from './DashboardCharts/HealthwidgetLine/HealthWidgetLine';
import HealthWidgetBar from './DashboardCharts/HealthWidgetBar/HealthWidgetBar';
// import EffortEstimation from './DashboardCharts/EffortEstimation/EffortEstimation';
// import TaskCompletionWidget from './DashboardCharts/TaskCompletionWidget/TaskCompletionWidget';
import FilterData from './DashboardCharts/FilterData/FilterData';
import CommonCharLoader from './DashboardCharts/CommonChartLoader/CommonChartLoader';
import CommonErrorMessage from './DashboardCharts/CommonChartLoader/ErrorMessageData';
import PIVelocity from './DashboardCharts/VelocityPI/PIVelocityChart';

class App extends Component {
  constructor(props) {
    super(props);
    const params = new URLSearchParams(window.location.search);
    this.state = {
      showChart: false,
      userBurnDownChart: [],
      showBurnDownChart: false,
      showHealthWidgetChart: false,
      showPiVelocityChart: false,
      healthWidgetChart: null,
      pivelocity: null,
      piName: null,
      healthSprintData: {
        sprintlength: null,
        totalsprintlength: null
      },
      percentworload: null,
      showMessage: '',
      piremdays: '',
      piErrorMessage: '',
      projectDetails: {
        projectId: params.get('projectId'),
        boardId: params.get('boardId')
      }
    };
    this.getDataFromFilter = this.getDataFromFilter.bind(this);
    this.healthDataFn = this.healthDataFn.bind(this);
  }

  /**
   * Method : It is used to recieve data from filter
   *  Date :17-06-2020
   *
   */
  getDataFromFilter = (method, showChart, message, data) => {
    this.setState({ showChart: true, showMessage: '' });
    switch (method) {
      case 'BURNDONW':
        this.setState({
          userBurnDownChart: data,
          showBurnDownChart: showChart,
          showMessage: message
        });
        break;
      case 'RESET':
        this.setState({ showBurnDownChart: showChart });
        break;
      default:
        break;
    }
  };

  healthDataFn = (data, flag = false) => {
    this.setState({ showHealthWidgetChart: false });
    if (data) {
      this.setState({ healthWidgetChart: data, showHealthWidgetChart: flag });
    }
  };

  healthSprintFn = (data) => {
    if (data) {
      this.setState({
        healthSprintData: {
          sprintlength: data.sprintlen,
          totalsprintlength: data.totalsprintlen
        }
      });
    }
  };

  percentCalc = (data) => {
    this.setState({
      percentworload: data
    });
  };

  healthpiremdays = (data) => {
    this.setState({
      piremdays: data
    });
  };

  piErrorMessageShow = (data) => {
    this.setState({
      piErrorMessage: data
    });
  };

  piVelocityFn = (data, flag = false) => {
    this.setState({ showPiVelocityChart: false });
    if (data) {
      this.setState({ pivelocity: data, showPiVelocityChart: flag });
    }
  };

  piValFn = (data) => {
    this.setState({ piName: data });
  };

  render() {
    const stateVal = this.state;
    return (
      <div>
        <FilterData
          projectDetails={stateVal.projectDetails}
          filterData={this.getDataFromFilter}
          healthData={this.healthDataFn}
          healthsprintsData={this.healthSprintFn}
          healthworkloadPercent={this.percentCalc}
          healthpiremday={this.healthpiremdays}
          piErrorMessage={this.piErrorMessageShow}
          piVelocityData={this.piVelocityFn}
          pi={this.piValFn}
        />
        {stateVal.showChart && (
          // eslint-disable-next-line react/jsx-no-comment-textnodes
          <div>
            <div className="flex headeline">
              <div className="chart-wrapper">
                <div className="health-widget-bar">
                  <h2>Health Widget</h2>
                  <div className="pi-rem-days">
                    {stateVal.piremdays !== '' && (
                      <span>
                        PI Remaining Days :
                        {stateVal.piremdays}
                      </span>
                      )}
                  </div>
                  {stateVal.showHealthWidgetChart && stateVal.healthWidgetChart !== 'nodata' ? (
                    <HealthWidgetBar
                      healthwidgetData={stateVal.healthWidgetChart}
                      healthWidgetSprintsData={stateVal.healthSprintData}
                      healthWorkloadPercentage={stateVal.percentworload}
                      healthpirem={stateVal.piremdays}
                    />
              ) : stateVal.healthWidgetChart === 'nodata' ? (
                <CommonErrorMessage message="Sorry! no data found" hideImage="YES" Errorval="" />
              ) : (
                <div>
                  <CommonCharLoader />
                </div>
                  )}
                </div>
              </div>
              <div className="chart-wrapper" id="timeline">
                <div className="timelines">
                  <h2 className="header marleft">
                    StoryPoints Burndown
                  </h2>
                  {stateVal.showBurnDownChart ? (
                    <TimeLinePrediction burnDownData={stateVal.userBurnDownChart} />
                  ) : stateVal.showMessage === '' ? (
                    <div>
                      <CommonCharLoader />
                    </div>
                  ) : (
                    <CommonErrorMessage message="Sorry! no data found" hideImage="YES" Errorval="" />
                      )}
                </div>
              </div>
            </div>
            <div id="pivelocity" className="pi-velocity">
              <h2>PI Velocity</h2>
              {stateVal.showPiVelocityChart && stateVal.pivelocity !== 'nodata' ? (
                <div className="chart-pivelocity">
                  <PIVelocity piVelocityData={stateVal.pivelocity} piValName={stateVal.piName} />
                </div>
            ) : stateVal.pivelocity === 'nodata' ? (
              <CommonErrorMessage message="Sorry! no data found" Errorval={stateVal.piErrorMessage} hideImage="YES" centerAlign="YES" />
            ) : (
              <div>
                <CommonCharLoader />
              </div>
                )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default App;
