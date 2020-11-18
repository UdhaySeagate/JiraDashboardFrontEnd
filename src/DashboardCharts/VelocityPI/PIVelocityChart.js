import React, { Component } from 'react';
import C3Chart from 'react-c3js';
import './PiVelocityChart.css';
import moment from 'moment';
import Tooltip from '@atlaskit/tooltip';
import styled from 'styled-components';
import saveSvgAsPng from 'save-svg-as-png';
import { TooltipPrimitive } from '@atlaskit/tooltip/styled';

class PIVelocity extends Component {
  constructor(props) {
    super(props);
    const velocityprops = this.props;
    const { completedSP, issues, remainingSP, sprints, sprintInfo, totalSP, velocity } = velocityprops.piVelocityData;
    this.state = {
      completedSP,
      forecast: this.forecastcnt(sprints),
      issues,
      remainingSP,
      sprintrem: this.calcplnedsprint(sprints),
      sprints: this.sprintConstruct(sprints),
      totalSP,
      sprintInfo,
      velocity,
      piValName: velocityprops.piValName,
      addedSP: [],
      initialSP: [],
      completedSPArr: [],
      predictedSP: [],
      tickVal: []
    };
  }

  componentDidMount() {
    this.chartRender();
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    const { completedSP, issues, sprintInfo, remainingSP, sprints, totalSP, velocity } = nextProps.piVelocityData;
    this.setState({
      completedSP,
      forecast: this.forecastcnt(sprints),
      issues,
      remainingSP,
      sprintrem: this.calcplnedsprint(sprints),
      sprints: this.sprintConstruct(sprints),
      totalSP,
      sprintInfo,
      velocity,
      piValName: nextProps.piValName
    });
    this.chartRender();
  }

  forecastcnt = (sprints) => {
    const cnt = sprints.filter((data) => data.state === 'forecast').length;
    return cnt;
  };

  calcplnedsprint = (sprints) => {
    const fullspnt = [...sprints];
    let activesp = 0;
    fullspnt.forEach((data) => {
      if ((data.state === 'active' && data.predicted !== null) || data.state === 'future') {
        activesp += 1;
      }
    });
    return activesp;
  };

  sprintConstruct = (sprints) => {
    const initsprnt = [...sprints];
    let sprintfull;
    if (initsprnt.length > 13) {
      const frcstsp = initsprnt.filter((data) => data.state === 'forecast');
      const actsptcnt = initsprnt.length - frcstsp.length;
      let actspnt = initsprnt.slice(0, actsptcnt);
      const val = {
        addedSP: null,
        completedSP: null,
        endDate: null,
        id: null,
        initialSP: 0,
        name: 'infoforhiddensprint',
        openSP: null,
        predicted: null,
        startDate: null,
        state: null
      };
      if (actsptcnt > 9) {
        const notfut = actspnt.filter(data => data.state !== 'future');
        const future = actspnt.filter(data => data.state === 'future');
        if (future.length > 2) {
          if (notfut.length === 7) {
            future.splice(2, future.length - 2);
          } else if (notfut.length > 7) {
            notfut.splice(1, notfut.length - 6, {...val, remvd: notfut.length - 6});
            future.splice(2, future.length - 2);
          } else {
            future.splice(1, future.length - 2, {...val, remvd: future.length - 2});
          } 
          actspnt = notfut.concat(future);
          if (frcstsp.length > 4) {
            frcstsp.splice(1, frcstsp.length - 3, {...val, remvd: frcstsp.length - 3});
          }
        } else {
          actspnt.splice(1, actspnt.length - 8, {...val, remvd: actspnt.length - 8});
          if (frcstsp.length > 4) {
            frcstsp.splice(1, frcstsp.length - 3, {...val, remvd: frcstsp.length - 3});
          }
        }
      } else {
        frcstsp.splice(1, sprints.length - 12, { ...val, remvd: sprints.length - 12 });
      }
      sprintfull = actspnt.concat(frcstsp);
    } else {
      sprintfull = [...sprints];
    }
    return sprintfull;
  };

  moveLabelUp = () => {
    const { sprints } = this.state;
      sprints.forEach((data, index) => {
        if (data && data.remvd) {
          document.querySelector(`.pi-velocity svg .c3-texts-SP-Planned > .c3-text-${index}`).classList.add('mvabove');
        }
      });
  };

  chartRender = () => {
    const { sprints } = this.state;
    const added = [];
    const init = [];
    const completed = [];
    const forecast = [];
    this.adddummydata();

    sprints.forEach((data) => {
      added.push(data.addedSP);
      init.push(data.initialSP);
      completed.push(data.completedSP);
      forecast.push(data.predicted);
    });
    this.setState({
      addedSP: [...added],
      initialSP: [...init],
      completedSPArr: [...completed],
      predictedSP: [...forecast],
      tickVal: [...sprints]
    });
  };

  adddummydata = () => {
    const { sprints } = this.state;
    if (sprints.length !== 0 && sprints.length < 8) {
      const initlen = [...sprints].length + 1;
      const num = 8 - sprints.length;
      for (let i = 0; i < num; i += 1) {
        sprints.push({
          addedSP: null,
          completedSP: null,
          endDate: null,
          id: null,
          initialSP: null,
          name: null,
          openSP: null,
          predicted: null,
          startDate: null,
          state: null
        });
      }
      setTimeout(() => {
        for (let j = initlen; j <= 8; j += 1) {
          document.querySelector(`.pi-velocity svg .c3-axis-x > g:nth-of-type(${j})`).classList.add('rmveLabel');
        }
      }, 10);
    }
  };

  addClassForforecast = (index) => {
      this.heightCheck();
      this.moveLabelUp();
    if (index >= 0 && document.querySelector(`.pi-velocity svg .c3-grid .c3-xgrids > .c3-xgrid:nth-child(${index})`) !== null) {
        const nodeList = document.getElementById('velocity-chart').querySelector('svg').querySelectorAll('.c3-grid .c3-xgrids .c3-xgrid');
        const grid = Array.from(nodeList);
        /* eslint-disable no-param-reassign */
        grid.forEach((element, inx) => {
          if (inx !== index - 1) {
            element.style.stroke = 'transparent';
          }
        });
        /* eslint-disable no-param-reassign */
        document.querySelector(`.pi-velocity svg .c3-grid .c3-xgrids > .c3-xgrid:nth-child(${index})`).classList.add('forecastline');
    } else {
      const nodeList = document.getElementById('velocity-chart').querySelector('svg').querySelectorAll('.c3-grid .c3-xgrids .c3-xgrid');
      const grid = Array.from(nodeList);
      /* eslint-disable no-param-reassign */
      grid.forEach(element => {
          element.style.stroke = 'transparent';
      });
      /* eslint-disable no-param-reassign */
    }
  };

  heightCheck = () => {
    const { sprints } = this.state;
    sprints.forEach((data, index) => {
      const ht1 = document.querySelector(`.pi-velocity svg .c3-bars-SP-Added > .c3-bar-${index}`).getBBox();
      const ht2 = document.querySelector(`.pi-velocity svg .c3-bars-SP-Planned > .c3-bar-${index}`).getBBox();
      const ht3 = document.querySelector(`.pi-velocity svg .c3-bars-SP-Completed > .c3-bar-${index}`).getBBox();
      if (ht1.height !== 0 && ht1.height < 15) {
        document.querySelector(`.pi-velocity svg .c3-chart-texts .c3-texts-SP-Added > .c3-text-${index}`).classList.add('remove');
      }
      if (ht2.height !== 0 && ht2.height < 15) {
        document.querySelector(`.pi-velocity svg .c3-chart-texts .c3-texts-SP-Planned > .c3-text-${index}`).classList.add('remove');
      }
      if (ht3.height !== 0 && ht3.height < 15) {
        document.querySelector(`.pi-velocity svg .c3-chart-texts .c3-texts-SP-Completed > .c3-text-${index}`).classList.add('remove');
      }
      if (data.predicted !== null) {
        const fh1 = document.querySelector(`.pi-velocity svg .c3-bars-Sprint-Forecast > .c3-bar-${index}`).getBBox();
        if (fh1.height !== 0 && fh1.height < 15) {
          document.querySelector(`.pi-velocity svg .c3-chart-texts .c3-texts-Sprint-Forecast > .c3-text-${index}`).classList.add('remove');
        }
      }
    });
  };

  nameSelect = (datatltip) => {
    let txt = '';
    switch (true) {
      case datatltip.name === 'Sprint Forecast':
        txt = 'predicted SP';
        break;
      case datatltip.name === 'SP Planned':
        txt = 'SP at start of sprint';
        break;
      case datatltip.name === 'SP Completed':
        txt = 'completed SP';
        break;
      case datatltip.name === 'SP Added':
        txt = 'added SP';
        break;
      default:
        txt = '';
        break;
    }
    return txt;
  };

  download = () => {
    const { sprints } = this.state;
    const nodeList2 = document.getElementById('velocity-chart').querySelector('svg').querySelectorAll('.c3-axis path');
    const nodeList3 = document.getElementById('velocity-chart').querySelector('svg').querySelectorAll('.tick line');
    const nodeList4 = document.getElementById('velocity-chart').querySelector('svg').querySelectorAll('.c3-chart-texts .c3-texts text');
    const nodeList5 = document.getElementById('velocity-chart').querySelector('svg').querySelectorAll('.c3-axis-x .tick text');
    const cmbine = Array.from(nodeList2).concat(Array.from(nodeList3));
    const txtcolor = Array.from(nodeList4);
    const tickclr = Array.from(nodeList5);
    /* eslint-disable no-param-reassign */
    txtcolor.forEach(element => {
      element.style.fill = '#172b4d';
      if(!element.textContent.includes("shown")) {
        element.style.transform = 'translateY(15px)';
      }
    });
    /* eslint-disable no-param-reassign */
    document.getElementById('velocity-chart').querySelector('svg').style.font = '10px sans-serif';
    document.getElementById('velocity-chart').querySelector('svg').style.backgroundColor = '#fff';
    document.getElementById('velocity-chart').querySelector('svg .c3-axis-x-label').style.transform = 'translate(0px, 20px)';
    /* eslint-disable no-param-reassign */
    cmbine.forEach(element => {
      element.style.fill = 'none';
      element.style.stroke = 'black';
    });
    tickclr.forEach(element => {
      element.style.fill = '#0152cc';
    });
    /* eslint-disable no-param-reassign */
    const nullval = sprints.filter(data => data.name === null);
    if (nullval.length > 0) {
      const nullvle = document.getElementById('velocity-chart').querySelector('svg').querySelectorAll('.c3-axis-x .rmveLabel line');
      /* eslint-disable no-param-reassign */
      nullvle.forEach(element => {
        element.style.stroke = 'transparent';
      });
      /* eslint-disable no-param-reassign */
    }
    const svg = document.getElementById('velocity-chart').getElementsByTagName('svg')[0];
    saveSvgAsPng.saveSvgAsPng(svg, 'PI Velocity Chart.png');
  };

  render() {
    const {
      forecast,
      sprintrem,
      piValName,
      velocity,
      sprintInfo,
      remainingSP,
      issues,
      sprints,
      completedSP,
      totalSP,
      tickVal,
      initialSP,
      addedSP,
      completedSPArr,
      predictedSP
    } = this.state;
    const thisval = this;
    const sprintdata1 = [...sprints];
    const forecastinx1 = (element) => element.name === null;
    const indexforcast1 = sprintdata1.findIndex(forecastinx1);
    const actualinx1 = indexforcast1 < 0 ? sprints.length : indexforcast1;
    const InlineDialog = styled(TooltipPrimitive)`
      background: white;
      box-sizing: content-box; /* do not set this to border-box or it will break the overflow handling */
      max-height: 300px;
      max-width: 1000px;
    `;
    const unestpercentpop = (
      <div className="estmpopup">
        <p>
          <span>{issues.percentage}</span>
          {' '}
          of issues do not have an estimate (
          {issues.unestimated}
          {' '}
          out of
          {' '}
          {issues.total}
          )
        </p>
      </div>
    );
    const velocityspnt = (
      <div className="velocitypopup">
        <p>
          {' '}
          Velocity is calculated based on the average of storypoints completed in 
          {' '}
          <span>
            {sprintInfo.join(', ')}
          </span>
        </p>
      </div>
    );
    const data = {
      x: 'x',
      columns: [
        ['x', ...tickVal],
        ['SP Planned', ...initialSP],
        ['SP Added', ...addedSP],
        ['SP Completed', ...completedSPArr],
        ['Sprint Forecast', ...predictedSP]
      ],
      type: 'bar',
      labels: {
        format(v, id, i, j) {
          let retn;
          if (sprints[i] && sprints[i].remvd && j === 0) {
            retn = `${sprints[i].remvd} sprints not shown`;
          } else if (v === 0) {
            retn = '';
          } else {
            retn = v;
          }
          return retn;
        }
      },
      colors: {
        'SP Planned': 'rgba(106, 149, 197)',
        'SP Added': 'rgba(192, 182, 242)',
        'SP Completed': 'rgba(121, 242, 192)',
        'Sprint Forecast': 'rgba(223, 225, 230)'
      },
      groups: [
        ['SP Completed', 'Sprint Forecast'],
        ['SP Planned', 'SP Added']
      ],
      order: false
    };
    const onrendered =  () => { 
      setTimeout(() => {
        const sprintdata = [...sprints];
        const isForecstt = (element) => element.state === 'forecast';
        const indexforcast = sprintdata.findIndex(isForecstt);
        this.addClassForforecast(indexforcast);
      }, 20);
      
    };
    const axis = {
      y: {
        label: {
          text: 'StoryPoints',
          position: 'outer-middle'
        },
        type: 'category'
      },
      x: {
        type: 'category',
        tick: {
          multiline: true,
          fit: true,
          centered: true,
          format(x) {
            let labelbar;
            const sprintdata = [...sprints];
            const forecastinx = (element) => element.name === null;
            const indexforcast = sprintdata.findIndex(forecastinx);
            const actualinx = indexforcast < 0 ? sprints.length : indexforcast;
            if (
              (sprints[x].initialSP === null && sprints[x].addedSP === null && sprints[x].completedSP === null && sprints[x].predicted === null) ||
              sprints[x].name === 'infoforhiddensprint'
            ) {
              labelbar = '';
            } else if ((sprints[x].state === 'active' && x === 0) && sprintInfo.indexOf(sprints[x].name) >= 0 && sprints[x].startDate !== null) {
              labelbar = `*${sprints[x].name} (${moment(sprints[x].startDate).format('DD/MMM/YY')}) (Active)`;
            } else if (x === 0 && sprintInfo.indexOf(sprints[x].name) >= 0 && sprints[x].startDate !== null) {
              labelbar = `*${sprints[x].name} (${moment(sprints[x].startDate).format('DD/MMM/YY')})`;
            } else if (sprints[x].state === 'active' && sprintInfo.indexOf(sprints[x].name) >= 0) {
              labelbar = `*${sprints[x].name} (Active)`;
            } else if (sprintInfo.indexOf(sprints[x].name) >= 0) {
              labelbar = `*${sprints[x].name}`;
            } else if (((sprints[x].state === 'active' && x === 0) || (sprints[x].state === 'active' && x === actualinx)) && sprints[x].startDate !== null) {
              labelbar = `${sprints[x].name} (${moment(sprints[x].startDate).format('DD/MMM/YY')}) (Active)`;
            } else if (x === actualinx - 1 && sprints[x].state === 'active' && sprints[x].endDate !== null) {
              labelbar = `${sprints[x].name} (${moment(sprints[x].endDate).format('DD/MMM/YY')}) (Active)`;
            } else if (sprints[x].state === 'active') {
              labelbar = `${sprints[x].name} (Active)`;
            } else if (x === 0 && sprints[x].startDate !== null) {
              labelbar = `${sprints[x].name} (${moment(sprints[x].startDate).format('DD/MMM/YY')})`;
            } else if (x === actualinx - 1 && sprints[x].endDate !== null) {
              labelbar = `${sprints[x].name} (${moment(sprints[x].endDate).format('DD/MMM/YY')})`;
            } else {
              labelbar = `${sprints[x].name}`;
            }
            return labelbar;
          }
        },
        label: {
          text: `Sprints of ${piValName}`,
          position: 'outer-center'
        }
      }
    };
    const padding = {
      top: 60,
      bottom: 60,
      right: 20
    };
    const size = {
      height: 450
    };
    const grid = {
      x: {
        show: true
      }
    };
    const legend = {
      position: 'inset',
      inset: {
        anchor: 'top-right',
        x: 20,
        y: -60,
        step: 2
      }
    };
    const bar = {
      width: {
        ratio: 0.5 // this makes bar width 50% of length between ticks
      },
      space: 0
    };
    const tooltip = {
      contents(d, defaultTitleFormat) {
        const headng = defaultTitleFormat(d[0].x);
        const splitss = headng.split(' ');
        let filtcheckdata;
        if (splitss.length >= 3 && splitss[splitss.length - 2].split('/').length === 3) {
          const splits = headng.split(' ');
          splits.splice(splits.length - 2, 2);
          if(splits[0].split('*').length > 1 && splits[0].split('*')[0] === ''){
            splits[0] = splits[0].split('*')[1];
          }
          filtcheckdata = splits.join(' ');
        } else if (splitss[splitss.length - 1] === '(Active)' || splitss[splitss.length - 1].split('/').length === 3) {
          const splits = headng.split(' ');
          splits.splice(splits.length - 1, 1);
          if(splits[0].split('*').length > 1 && splits[0].split('*')[0] === ''){
            splits[0] = splits[0].split('*')[1];
          }
          filtcheckdata = splits.join(' ');
        } else {
          const splits = headng.split('*');
          if (splits.length > 1) {
            filtcheckdata = splits[1];
          } else {
            filtcheckdata = headng;
          }
          
        }
        const filtData = sprints.filter((datas) => datas.name === filtcheckdata);
        let headtxt;
        let cont1;
        let cont;
        let forcast;
        if (filtData.length > 0) {
          let dt = '';
          if (filtData[0].startDate !== null && filtData[0].endDate !== null) {
            dt = `(${moment(filtData[0].startDate).format('DD/MMM/YY')} - ${moment(filtData[0].endDate).format('DD/MMM/YY')})`;
          }
          if (filtData[0].state === 'active' && sprintInfo.indexOf(filtData[0].name) >= 0) {
            const dtif = dt !== '' ? dt : `<div>${dt}</div>`;
            headtxt = `<div><h6>*${filtData[0].name}</h6> <span>(Active)</span></div>${dtif}`;
          } else if (sprintInfo.indexOf(filtData[0].name) >= 0) {
            const dtif = dt !== '' ? dt : `<div>${dt}</div>`;
            headtxt = `<div><h6>*${filtData[0].name}</h6></div>${dtif}`;
          } else if (filtData[0].state === 'active') {
            const dtif = dt !== '' ? dt : `<div>${dt}</div>`;
            headtxt = `<div><h6>${filtData[0].name}</h6> <span>(Active)</span></div>${dtif}`;
          } else {
            const dtif = dt !== '' ? dt : `<div>${dt}</div>`;
            headtxt = `<div><h6>${filtData[0].name}</h6></div>${dtif}`;
          }
          const initsp =
            d[0] && d[0].value !== null && d[0].value >= 0 ? `<tr><td><span>${d[0].value}</span></td><td>${thisval.nameSelect(d[0])}</td></tr>` : '';
          const addsp =
            d[1] && d[1].value !== null && d[1].value >= 0 ? `<tr><td><span>${d[1].value}</span></td> <td>${thisval.nameSelect(d[1])}</td></tr>` : '';
          const cmpsp =
            d[2] && d[2].value !== null && d[2].value >= 0 ? `<tr><td><span>${d[2].value}</span></td><td>${thisval.nameSelect(d[2])}</td></tr>` : '';
          const presp =
            d[3] && d[3].value !== null && d[3].value >= 0 ? `<tr><td><span>${d[3].value}</span></td><td>${thisval.nameSelect(d[3])}</td></tr>` : '';
          const remsp =
            d[0] && d[1] && d[2] && d[0].value !== null && d[1].value !== null && d[2].value !== null
              ? `<tr><td><span>${d[0].value + d[1].value - d[2].value}</span></td><td>remaining SP</td></tr>`
              : '';
          cont = `<div class="custom-tooltip">`;
          cont1 = `<table>${initsp}${addsp}${cmpsp}${presp}${remsp}`;
          forcast = '</table></div>';
        } else {
          cont = `<div>`;
          headtxt = ``;
          cont1 = ``;
          forcast = `</div>`;
        }
        return cont + headtxt + cont1 + forcast;
      }
    };

    return (
      <div>
        <div className="sp-info">
          <div>
            <span>{issues.percentage}</span>
            {' '}
            unestimated issue(s)
            <Tooltip component={InlineDialog} content={unestpercentpop}>
              <span className="info-icon">i</span>
            </Tooltip>
          </div>
          <div>
            <span>{completedSP}</span>
            {' '}
            out of
            {' '}
            <span>{totalSP}</span>
            {' '}
            SP Completed
          </div>
        </div>
        <div className="velocity-info">
          <div>
            Planned sprint(s) remaining: 
            {' '}
            <span>{sprintrem}</span>
          </div>
          {velocity > 0 && (
            <div>
              Velocity: 
              {' '}
              <span>{velocity}</span>
              <Tooltip component={InlineDialog} content={velocityspnt}>
                <span className="info-icon">i</span>
              </Tooltip>
            </div>
          )}
          <div>
            {' '}
            SP Remaining: 
            {' '}
            <span>{remainingSP}</span>
          </div>
          {forecast !== null && (
            <div className="forcast-info">
              {forecast > 0 && (
                <div>
                  <div className="pull-left">Sprint(s) forecast: </div>
                  {' '}
                  <div>
                    <span>{forecast}</span>
                    {' '}
                    (Based on the velocity from last 3 sprints,
                    {' '}
                    <span>{piValName}</span>
                    {' '}
                    completion date will be
                    {' '}
                    <span>{moment(sprints[actualinx1 - 1].endDate).format('DD/MMM/YY')}</span>
                    )
                  </div>
                </div>
              )}
              {forecast === 0 && (
                <div>
                  Sprints forecast: No forecast available (A forecast cannot be shown until atleast 3 sprints have been completed with minimum 1 completed SP
                  each).
                </div>
              )}
            </div>
          )}
        </div>
        {piValName && (
          <div id="velocity-chart" className="pivelocity-chart">
            <div className="download-img">
              <div role="button" onClick={this.download} onKeyDown={this.download} tabIndex={0}>
                <img src={require("../../images/download.png")} alt="download" />
                <span>Download Image</span>
              </div>
            </div>
            <C3Chart grid={grid} data={data} bar={bar} onrendered={onrendered} axis={axis} size={size} tooltip={tooltip} padding={padding} legend={legend} />
          </div>
        )}
      </div>
    );
  }
}

export default PIVelocity;
