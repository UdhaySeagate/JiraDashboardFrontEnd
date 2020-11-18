import React, { Component } from 'react';
import C3Chart from 'react-c3js';
import Tooltip from '@atlaskit/tooltip';
import styled from 'styled-components';
import { TooltipPrimitive } from '@atlaskit/tooltip/styled';
import saveSvgAsPng from 'save-svg-as-png';
import Popover from './popover';
import './HealthWidget.css';
import 'c3/c3.css';

class HealthWidgetBar extends Component {
  constructor(props) {
    super(props);
    const healthprops = this.props;
    const { healthinfo, taskstatus, popover } = healthprops.healthwidgetData;
    this.state = {
      barColumn: [],
      healthinfo,
      taskstatus,
      popover,
      sprintcount: props.healthWidgetSprintsData
    };
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    const { healthinfo, taskstatus } = nextProps.healthwidgetData;
    this.setState(
      {
        healthinfo,
        taskstatus,
        sprintcount: nextProps.healthWidgetSprintsData
      }
    );
    this.onLoadingData();
  }

  onLoadingData = () => {
    const { healthwidgetData } = this.props;
    const arr = [];
    healthwidgetData.completionstatus.forEach((element) => {
      arr.push(Math.round(element.percent));
    });
    this.setState({ barColumn: [...arr] });
  };

  download = () => {
    const nodeList = document.getElementById('health-chart').querySelector('svg').querySelectorAll('.c3-chart .c3-chart-line path');
    const nodeList2 = document.getElementById('health-chart').querySelector('svg').querySelectorAll('.c3-axis path');
    const nodeList3 = document.getElementById('health-chart').querySelector('svg').querySelectorAll('.c3 .tick line');
    const lineGraph = Array.from(nodeList);
    const cmbine = Array.from(nodeList2).concat(Array.from(nodeList3));
    /* eslint-disable no-param-reassign */
    lineGraph.forEach(element => {
      element.style.fill = "none";
    });
    /* eslint-disable no-param-reassign */
    document.getElementById('health-chart').querySelector('.health-widget-bar .c3-legend-item').style.display = 'none';
    document.getElementById('health-chart').querySelector('svg').style.font = '10px sans-serif';
    document.getElementById('health-chart').querySelector('svg').style.backgroundColor = '#fff';
    /* eslint-disable no-param-reassign */
    cmbine.forEach(element => {
      element.style.fill = 'none';
      element.style.stroke = 'black';
    });
    /* eslint-disable no-param-reassign */
    const svg = document.getElementById('health-chart').getElementsByTagName('svg')[0];
    saveSvgAsPng.saveSvgAsPng(svg, 'Health Widget Chart.png');
  };

  render() {
    const { popover, barColumn, sprintcount, healthinfo, taskstatus } = this.state;
    const InlineDialog = styled(TooltipPrimitive)`
      background: white;
      box-sizing: content-box; /* do not set this to border-box or it will break the overflow handling */
      max-height: 300px;
      max-width: 1000px;
    `;
    const resolvedpop = (
      <div className="popover-resolved popover">
        <Popover story={popover.story.cmpltd} task={popover.task.cmpltd} subtask={popover.subtask.cmpltd} bug={popover.bug.cmpltd} />
      </div>
    );
    const rempop = (
      <div className="popover-rem popover">
        <Popover story={popover.story.rem} task={popover.task.rem} subtask={popover.subtask.rem} bug={popover.bug.rem} />
      </div>
    );
    const totalpop = (
      <div className="popover-total popover">
        <Popover story={popover.story.total} task={popover.task.total} subtask={popover.subtask.total} bug={popover.bug.total} />
      </div>
    );

    const data = {
      x: 'x',
      columns: [
        ['x', 'Stories', 'Tasks', 'Sub-Tasks', 'Bugs'],
        ['Completion%', ...barColumn]
      ],
      type: 'bar',
      color(inColor, datas) {
        const colors = ['rgba(100, 84, 192)', 'rgba(53, 179, 126)', 'rgba(255, 171, 0)', 'rgba(255, 142, 115)'];
        if (datas.index !== undefined) {
          return colors[datas.index];
        }
        return inColor;
      },
      labels: {
        format(v) {
          return `${v}%`;
        }
      }
    };
    const size = {
      height: 260
    };
    const padding = {
      top: 20,
      right: 20
    }
    const tooltip = {
      tooltip: {
        class: 'capacity-lines'
      }
    };
    const axis = {
      rotated: true,
      x: {
        type: 'category'
      },
      y: {
        max: 92,
        label: {
          text: 'Completion (%) based on ticket count',
          position: 'outer-center'
        }
      }
    };

    return (
      <span>
        <div className="health-wrapper">
          <div className="health-info">
            <div>
              <div>Sprint(s)</div>
              <div>
                Showing
                <span>
                  {' '}
                  {sprintcount.sprintlength}
                  {' '}
                  out of
                  {' '}
                  {sprintcount.totalsprintlength}
                </span>
              </div>
            </div>
            <div>
              <div> StoryPoints</div>
              <div>
                <span>
                  {healthinfo.tasks.cmpstptswoassignees}
                  {' '}
                  out of
                  {' '}
                  {healthinfo.tasks.totlstptswoassignees}
                  {' '}
                </span>
                completed
              </div>
            </div>
            {/* <div>
                <div>Added SP</div>
                <div>
                  {workloadpercent !== 0 && workloadpercent <= 100 && workloadpercent !== null && (
                  <span>
                    {workloadpercent}
                    %
                  </span>
                )} 
                  {' '}
                  {workloadtxt}
                </div>
              </div> */}
            <div>
              <div>Progress</div>
              <div className="progress-info">
                <div>
                  <span>
                    {Math.round(healthinfo.progress.value)}
                    %
                  </span>
                  {' '}
                  of planned tickets completed
                </div>
                <div>
                  <span>
                    {Math.round(healthinfo.tasks.cmpltdpercent)}
                    %
                    {' '}
                  </span>
                  of planned storypoints completed
                </div>
              </div>
            </div>
            <div className="info-desc">* SP indicates storypoints</div>
          </div>
          <div className="task-info">
            <div>
              <div className="green">
                <Tooltip position="right" component={InlineDialog} content={resolvedpop}>
                  <span>{healthinfo.tasks.overallcmpltdiss === '' ? 0 : healthinfo.tasks.overallcmpltdiss}</span>
                </Tooltip>
                <span>Resolved</span>
              </div>
              <div className="orange">
                <Tooltip position="right" component={InlineDialog} content={rempop}>
                  <span>
                    {healthinfo.tasks.overallcmpltdissrem === '' ? 0 : healthinfo.tasks.overallcmpltdissrem}
                    {' '}
                  </span>
                </Tooltip>
                <span>Remaining</span>
              </div>
              <div className="blue">
                <Tooltip position="right" component={InlineDialog} content={totalpop}>
                  <span>
                    {taskstatus.totaltasks}
                    {' '}
                  </span>
                </Tooltip>
                <span>Total Tickets</span>
              </div>
            </div>
          </div>
        </div>
        <div id="health-chart">
          <div className="download-img">
            <div role="button" onClick={this.download} onKeyDown={this.download} tabIndex={0}>
              <img src={require("../../images/download.png")} alt="download" />
              <span>Download Image</span>
            </div>
          </div>
          <C3Chart data={data} axis={axis} tooltip={tooltip} size={size} padding={padding} />
        </div>
      </span>
    );
  }
}

export default HealthWidgetBar;
