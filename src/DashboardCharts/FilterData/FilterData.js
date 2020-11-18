import React, { Component } from 'react';
import './FilterData.css';
import Select from '@atlaskit/select';
import Button from '@atlaskit/button';
import Loader from 'react-loader-spinner';
import Dropdown, { DropdownItemCheckbox, DropdownItemGroupCheckbox, DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import moment from 'moment';
import Tooltip from '@atlaskit/tooltip';
import styled from 'styled-components';
import { TooltipPrimitive } from '@atlaskit/tooltip/styled';
import ApiServiceCall from '../../serviceCall/apiServiceCall';
import CommonDateFunction from '../../serviceCall/CommonDateFunction';
import CommonErrorMessage from '../CommonChartLoader/ErrorMessageData';

/**
 * Description: Class used to include the all filte list
 * Author: Baskar.V.P
 * Date: 15-06-2020
 */
class FilterData extends Component {
  constructor(props) {
    super(props);
    const propss = this.props;
    this.state = {
      // projectIdOrKey: 'E2',
      projectIdOrKey: propss.projectDetails.projectId ? propss.projectDetails.projectId : 'EOS',
      // boardId: '1274',
      boardId: propss.projectDetails.boardId ? propss.projectDetails.boardId : '1097',
      burnDownStatus: false,
      healthWidgetStatus: false,
      overloadCalStatus: false,
      piWidgetStatus: false,
      filteData: [],
      pidata: [],
      sprintdata: [],
      componentdata: [],
      sprintOverAll: [],
      formVal: {},
      apiCallStatus: false,
      activeSprintData: {
        sprintName: '',
        plannedCap: '',
        completed: '',
        remainingDays: '',
        PIName: '',
        status: false,
        totalActive: ''
      },
      activePIName: '',
      pidatastatus: false,
      sprintdataStatus: false,
      showloader: true,
      sprintLoadingMesg: 'Loading ...',
      selectedCompItems: [],
      selectedSprintItems: [],
      buttonStatus: false,
      sprintdetailsdata: [],
      componentOverAll: [],
      activeSprintMoreData: [],
      showErrorMessage: '',
      cpyPIdetails: null,
      cpyComp: null,
      sprintError:''
    };
    this.api = new ApiServiceCall();
    this.commonDateFunc = new CommonDateFunction();
  }

  /**
   * Method : It is used to retrieve data from API based on project call
   * Date : 16-06-2020
   * Author : Baskar.V.P
   */
  componentDidMount() {
    const stateVal = this.state;
    const params = {
      projectIdOrKey: stateVal.projectIdOrKey,
      boardId: stateVal.boardId
    };
    const response = this.api.callApiServiceMethod('PI_DATA_URL', params);
    response.then((data) => {
      if (data.status === 'success' && data.statusCode === '200') {
        this.setState({ pidatastatus: true, filteData: data.data });
        this.pidataGet();
        this.componentDataGet();
        this.sprintdataGet();
      } else {
        this.setState({ showErrorMessage: 'Error in getting response' });
      }
    });
  }

  pidataGet = () => {
    const a = [];
    this.state.filteData.pi.forEach((element) => {
      if (element.name.toUpperCase().startsWith('CORTX-PI') && !element.released) {
        a.push({
          name: element.name,
          id: element.id,
          released: element.released,
          label: element.name,
          value: element.id,
          releaseDate: element.releaseDate === undefined ? '' : this.commonDateFunc.getChangeFormat(element.releaseDate, 'YYYY-MM-DD'),
          startDate: element.startDate === undefined ? '' : this.commonDateFunc.getChangeFormat(element.startDate, 'YYYY-MM-DD')
        });
      }
    });
    const sortedArray = a.sort((aa, bb) => moment(aa.releaseDate).format('YYYYMMDD') - moment(bb.releaseDate).format('YYYYMMDD'));
    this.setState({ pidata: [...sortedArray] });
  };

  /**
   * Method : Following finction is used to convnert the component into format
   * Date : 17-06-20202
   * Author: Baskar.V.P
   */
  componentDataGet = () => {
    const a = [];
    const { filteData } = this.state;
    this.state.filteData.components.forEach((element) => {
      a.push(element.name);
    });
    this.setState({
      componentdata: [...a],
      componentOverAll: filteData.components
    });
  };

  sprintdataGet = (pidata) => {
    this.setState({ sprintLoadingMesg: 'Loading...' });
    const { activeSprintData } = this.state;
    const activeSprnt = activeSprintData;
    const a = [];
    let findActivePI = {};
    activeSprnt.status = false;
    activeSprnt.totalActive = '';
    if (typeof pidata === 'undefined') {
      const { label, value } = this.state.pidata[0];
      findActivePI = { id: value, name: label };
      this.setState({
        formVal: { name: label, id: value }
      });
    } else {
      findActivePI = { id: pidata.id, name: pidata.name };
    }
    this.setState({
      activePIName: findActivePI.name,
      sprintdata: [],
      activeSprintData: activeSprnt,
      sprintdataStatus: false,
      sprintError:''
    });
    const params = {
      versionId: findActivePI.id,
      boardId: this.state.boardId,
      projectIdOrKey: this.state.projectIdOrKey
    };
    const response = this.api.callApiServiceMethod('SPRINT_DATA_URL', params);
    response.then((data) => {
      this.setState({ sprintdataStatus: true, buttonStatus: true });
      if (data.statusCode === '200' && data.status === 'success') {
        // eslint-disable-next-line no-param-reassign
        data.data.sprints = data.data.sprints.filter((element) => element.name.toUpperCase().startsWith('EES_SPRINT'));
        const sprintObj = data.data;
        if (sprintObj.sprints.length > 0) {
          const removedDateSpr = this.removeSprintsDateRange(sprintObj.sprints, params);
          this.setState({ sprintdetailsdata: [...removedDateSpr] });
          if(removedDateSpr.length > 0){
            this.setState({ sprintOverAll : removedDateSpr  });
            removedDateSpr.forEach((element) => {
            a.push(element.name);
            });
          }else{
            this.setState({ sprintLoadingMesg: 'No sprints' });
          }
        } else {
          this.setState({ sprintLoadingMesg: 'No sprints' });
        }
        if ('activeSprint' in sprintObj && this.state.sprintdetailsdata.length>0) {
          // set active sprints data
          activeSprnt.sprintName = sprintObj.activeSprint.sprintName;
          activeSprnt.status = true;
          activeSprnt.PIName = findActivePI.name;
          activeSprnt.plannedCapacity = sprintObj.activeSprint.plannedCapacity;
          activeSprnt.completed = sprintObj.activeSprint.completed;
          const remDays = this.commonDateFunc.getNoofDaysBetween(moment(), sprintObj.activeSprint.endDate);
          activeSprnt.remainingDays = remDays < 0 ? 0 : remDays;
          activeSprnt.totalActive = sprintObj.activeSprint.totalActive;
          if (sprintObj.activeSprint.totalActive > 1) {
            this.setState({ buttonStatus: false });
            this.getActiveSprint(findActivePI, sprintObj.activeSprint, activeSprnt);
            activeSprnt.status = false;
          }
          this.setState({ activeSprintData: activeSprnt });
        }
        // call only on load
        this.setState({
          sprintdata: [...a],
          selectedSprintItems: [...a]
        });
        if (this.state.showloader) {
          this.callChartsAPI(findActivePI, 'ONLOAD');
        } else {
          this.setState({ apiCallStatus: true });
        }
        this.setState({ showloader: false });
      }
    });
  };


  removeSprintsDateRange = (sprint, params) => {
    const pidataRef = this.state.pidata;
    const sprintArray = [];
    const piStartDateValidation = pidataRef.filter((item) => item.id === params.versionId)[0];
    console.log(piStartDateValidation,'piStartDateValidation');
    if(piStartDateValidation.startDate !== '' && piStartDateValidation.releaseDate !==''){
    sprint.forEach((data) => {
        if (data.startDate !== undefined) {
          if (
            this.commonDateFunc.compareDatesisSameorBefore(piStartDateValidation.startDate, moment(data.startDate).format('YYYY-MM-DD')) &&
            this.commonDateFunc.compareDatesisSameorAfter(piStartDateValidation.releaseDate, data.endDate)
          ) {
            sprintArray.push(data);
          }
        } else {
          sprintArray.push(data);
        }
      });
    }else{
      this.setState({
        sprintError: 'YES'
      })
    }
    return sprintArray;
  }

  getActiveSprint = (findActivePI, response, activeSprnt) => {
    const params = {
      projectIdOrKey: this.state.projectIdOrKey,
      boardId: this.state.boardId,
      sprints: response.activeList.toString(),
      versionId: findActivePI.id
    };
    const respone = this.api.callApiServiceMethod('GET_SPRINT_DETAILS', params);
    respone.then((data) => {
      this.setState({ buttonStatus: true });
      // if(data.statusCode === '200'){
      const actData = data.data.activeSprint;
      actData.forEach((element, index) => {
        const remDays = this.commonDateFunc.getNoofDaysBetween(moment(), actData[index].endDate);
        actData[index].remainingDays = remDays < 0 ? 0 : remDays;
        actData[index].PIName = activeSprnt.PIName;
        actData[index].totalActive = activeSprnt.totalActive;
      });
      const sprintDataFind = activeSprnt;
      sprintDataFind.status = true;
      actData.forEach((element, index) => {
        actData[index].showUnderline = false;
        if (actData[index + 1] !== undefined) {
          actData[index].showUnderline = actData.length > 0;
        }
      });
      this.setState({
        activeSprintMoreData: actData,
        activeSprintData: sprintDataFind
      });
    });
  };

  chgInput = (e, data) => {
    this.setState({
      buttonStatus: false,
      selectedSprintItems: [],
      selectedCompItems: []
    });
    const obj = { name: data.label, id: data.value };
    this.setState({ formVal: obj });
    this.sprintdataGet(obj);
  };

  getFilterVal = (e) => {
    this.props.filterData('RESET', false, '');
    this.props.healthData('loader', false);
    this.props.healthworkloadPercent(null);
    e.preventDefault();
    this.callChartsAPI(this.state.formVal, 'SUBMIT');
  };

  handleSelection = (id) => {
    this.setState({ apiCallStatus: true });
    const selectedItem = this.state.selectedCompItems;
    if (selectedItem.includes(id)) {
      this.setState({
        selectedCompItems: selectedItem.filter((item) => item !== id)
      });
    } else {
      this.setState({
        selectedCompItems: [...selectedItem, id]
      });
    }
  };

  handleSelectionSprint = (id) => {
    this.setState({ apiCallStatus: true });
    const selectedItem = this.state.selectedSprintItems;
    if (selectedItem.includes(id)) {
      this.setState({
        selectedSprintItems: selectedItem.filter((item) => item !== id)
      });
    } else {
      this.setState({
        selectedSprintItems: [...selectedItem, id]
      });
    }
  };

  callChartsAPI = (PIdetails, callType) => {
    this.props.filterData();
    this.setState({
      buttonStatus: false,
      burnDownStatus: false,
      healthWidgetStatus: false,
      overloadCalStatus: false,
      piWidgetStatus: false
    });
    const sprinParamsData = [];
    const allSprintData = [];
    const componentParamData = [];
    // get sprint value
    if (this.state.selectedSprintItems.length > 0) {
      this.state.selectedSprintItems.forEach((sprinName) => {
        sprinParamsData.push(this.state.sprintOverAll.filter((spr) => spr.name === sprinName)[0].id);
      });
    }
    if (this.state.selectedCompItems.length > 0) {
      this.state.selectedCompItems.forEach((compName) => {
        componentParamData.push(this.state.componentOverAll.filter((comp) => comp.name === compName)[0].id);
      });
    }
    const params = {
      projectIdOrKey: this.state.projectIdOrKey,
      boardId: this.state.boardId,
      versionId: PIdetails.id,
      sprints: sprinParamsData.toString(),
      components: componentParamData.toString()
    };
    if (this.state.sprintdetailsdata.length > 0) {
      this.state.sprintdetailsdata.forEach((data) => {
        allSprintData.push(data.id);
      });
    }

    const params1 = {
      ...params,
      sprints: allSprintData.toString()
    };
    // proces to get burndown chart
    this.getBurnDownChart(params, callType);
    this.healthwidgetDataGet(params);
    // this.workloadCalc(params);
    this.piVelocity(params1);
  };

  setButtonStatus = () => {
    if (this.state.burnDownStatus && this.state.healthWidgetStatus && this.state.overloadCalStatus && this.state.piWidgetStatus) {
      this.setState({ buttonStatus: true, apiCallStatus: false });
    } else {
      this.setState({ buttonStatus: false });
    }
  };

  getBurnDownChart = (params, callType) => {
    this.props.healthpiremday('');
    const pidataRef = this.state.pidata;
    const thisCall = this;
    if (this.state.sprintdetailsdata.length > 0) {
      const piStartDateValidation = pidataRef.filter((item) => item.id === params.versionId)[0];
      let remdays = thisCall.commonDateFunc.getNoofDaysBetween(moment(), piStartDateValidation.releaseDate);
      remdays = remdays < 0 ? 0 : remdays;
      thisCall.props.healthpiremday(`${remdays} [End Date: ${moment(piStartDateValidation.releaseDate).format('DD-MMM-YY')}]`);
      const respone = this.api.callApiServiceMethod('GET_USER_STORY_BURN_DOWN', params);
      // eslint-disable-next-line func-names
      respone.then(function (data) {
        thisCall.setState({ burnDownStatus: true });
        thisCall.setButtonStatus();
        if (data.statusCode === '200' && data.status === 'success') {
          window.parent.postMessage('triggerEvent', '*');
          const burnObj = data.data;
          const burndown = {
            userBornDownData: burnObj,
            PIrelaseDetails: piStartDateValidation,
            sprintDetails: thisCall.state.sprintOverAll,
            sprintDetailsLength: thisCall.state.sprintOverAll.length,
            callType,
            selectedSprint: thisCall.state.selectedSprintItems
          };
          thisCall.props.filterData('BURNDONW', true, '', burndown);
        } else {
          thisCall.props.filterData('BURNDONW', false, 'Sorry! No data found');
        }
      });
    } else {
      thisCall.setState({ burnDownStatus: true });
      thisCall.setButtonStatus();
      thisCall.props.filterData('BURNDONW', false, 'Sorry! No data found');
    }
  };

  handleSelectAll = (dropdownType) => {
    const { sprintdata, componentdata } = this.state;
    this.setState({ apiCallStatus: true });
    if (dropdownType === 'sprint') {
      if (this.state.sprintdata.length === this.state.selectedSprintItems.length) {
        this.setState({
          selectedSprintItems: [],
          sprintdata
        });
      } else {
        this.setState({
          selectedSprintItems: [...sprintdata],
          sprintdata
        });
      }
    } else if (this.state.selectedCompItems.length === this.state.componentdata.length) {
      this.setState({
        selectedCompItems: [],
        componentdata
      });
    } else {
      this.setState({
        selectedCompItems: [...componentdata],
        componentdata
      });
    }
  };

  piVelocity = (params) => {
    let piDateValidation = true;
    const pidataRef = this.state.pidata;
    const { sprintdetailsdata, activePIName } = this.state;
    const thisVal = this;
    const piStartDateValidation = pidataRef.filter((item) => item.id === params.versionId)[0];
    piDateValidation = this.commonDateFunc.compareDatesisSameorAfter(moment(), piStartDateValidation.startDate);
    // eslint-disable-next-line no-unneeded-ternary
    if (sprintdetailsdata.length > 0 && piDateValidation) {
      if (params.versionId !== this.state.cpyPIdetails || params.components !== this.state.cpyComp) {
        thisVal.props.piVelocityData('loader', false);
        thisVal.props.pi(activePIName);
        const response = this.api.callApiServiceMethod('GET_PI_VELOCITY_INFORMATION', params);
        response.then((data) => {
          window.parent.postMessage('triggerEvent', '*');
          thisVal.setState({ piWidgetStatus: true });
          thisVal.setButtonStatus();
          this.setState({
            cpyPIdetails: params.versionId,
            cpyComp: params.components
          });
          if (data.statusCode === '200' && data.data !== 'nodata') {
            thisVal.props.piVelocityData(data.data, true);
          } else {
            thisVal.props.piVelocityData('nodata');
          }
        });
      } else {
        thisVal.props.pi(activePIName);
        thisVal.setState({ piWidgetStatus: true });
      }
    } else {
      this.setState({
        cpyPIdetails: params.versionId,
        cpyComp: params.components
      });
      thisVal.setState({ piWidgetStatus: true });
      thisVal.setButtonStatus();
      if (!piDateValidation && sprintdetailsdata.length !== 0) {
        const message = `Forecast cannot be shown for future  PI : ${piStartDateValidation.name} [${moment(piStartDateValidation.startDate).format('DD-MMM')} to ${moment(piStartDateValidation.releaseDate).format('DD-MMM')}]`;
        thisVal.props.piErrorMessage(message);
        thisVal.props.piVelocityData('nodata');
      } else {
        thisVal.props.piErrorMessage('');
        thisVal.props.piVelocityData('nodata');
      }
    }
  };

  healthwidgetDataGet = (params) => {
    const { sprintdetailsdata, selectedSprintItems } = this.state;
    const thisVal = this;
    const paramcpy = { ...params };
    if (paramcpy.sprints === '') {
      const sprintparams = [];
      sprintdetailsdata.forEach((data) => {
        sprintparams.push(data.id);
      });
      paramcpy.sprints = sprintparams.toString();
    }
    if (sprintdetailsdata.length > 0) {
      const respone = this.api.callApiServiceMethod('GET_HEALTH_WIDGET_INFORMATION', params);
      respone.then((data) => {
        window.parent.postMessage('triggerEvent', '*');
        thisVal.setState({ healthWidgetStatus: true });
        thisVal.setState({ overloadCalStatus: true });
        thisVal.setButtonStatus();
        if (data.statusCode === '200' && data.data !== 'nodata') {
          thisVal.props.healthData(data.data, true);
          thisVal.props.healthsprintsData({
            sprintlen: selectedSprintItems.length > 0 ? selectedSprintItems.length : sprintdetailsdata.length,
            totalsprintlen: sprintdetailsdata.length
          });
        } else {
          thisVal.props.healthData('nodata');
        }
      });
    } else {
      thisVal.setState({ healthWidgetStatus: true });
      thisVal.setState({ overloadCalStatus: true });
      thisVal.setButtonStatus();
      thisVal.props.healthData('nodata');
    }
  };

  /**
   * Method : Following finction is used to render the HTML with js default react method
   * Date : 16-06-20202
   * Author: Baskar.V.P
   */
  render() {
    const stateVal = this.state;
    const InlineDialog = styled(TooltipPrimitive)`
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      box-sizing: content-box; /* do not set this to border-box or it will break the overflow handling */
      color: #333;
      border: 1px solid blue;
      max-height: 300px;
      max-width: 1000px;
      padding: 8px 12px;
    `;
    const cont = (
      <div className="">
        {stateVal.activeSprintMoreData.length > 0 && (
          <div>
            {stateVal.activeSprintMoreData.map((data, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className={data.showUnderline ? 'paddten details-pi underline' : 'paddten details-pi'}>
                <div className="">
                  <span>
                    <span className="commonLable">Active Sprint :</span>
                    <span className="aheader">
                      {' '}
                      {data.sprintName}
                    </span>
                  </span>
                </div>
                <div className="underlinpad">
                  <span className="paddrightalig">
                    <span className="commonLable">Planned : </span>
                    <span className="commonstories">
                      {data.plannedCapacity}
                      {' '}
                      SP
                    </span>
                  </span>
                  <span className="paddrightalig">
                    <span className="commonLable"> Completed : </span>
                    {' '}
                    <span className="commonstories">
                      {data.completed}
                      {' '}
                      SP
                    </span>
                  </span>
                  <span className="paddrightalig">
                    <span className="commonLable"> Remaining Days : </span>
                    <span className="commonstories">{data.remainingDays}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
    return (
      <div className="filter-wrapper">
        {stateVal.showloader && !stateVal.sprintdataStatus && (
          <div className="loaderDiv">
            {stateVal.showErrorMessage === '' && <Loader type="Grid" color="#00BFFF" height={60} width={50} />}
            {!stateVal.pidatastatus && stateVal.showErrorMessage === '' && (
              <span className="loadercontent">Please wait while loading PI and components ... </span>
            )}
            {stateVal.pidatastatus && !stateVal.sprintdataStatus && stateVal.showErrorMessage === '' && (
              <span className="loadercontent">
                Please wait while loading sprints from
                {' '}
                {stateVal.activePIName}
                {' '}
                ...
                {' '}
              </span>
            )}
            {stateVal.showErrorMessage !== '' && <CommonErrorMessage hideImage="NO" Errorval="" message={stateVal.showErrorMessage} />}
          </div>
        )}
        {!stateVal.showloader && (
          <div className="filterdata flexfilter">
            <div>
              {stateVal.pidata.length > 0 && (
                <Dropdown
                  trigger={(
                    <span>
                      <div className="rightAlign">{stateVal.formVal.name}</div>
                    </span>
                  )}
                  triggerType="button"
                  triggerButtonProps={{ isDisabled: !stateVal.buttonStatus }}
                >
                  <DropdownItemGroup>
                    {stateVal.pidata.map((id) => (
                      <DropdownItem tooltipPosition="top" key={id} onClick={(event) => this.chgInput(event, id)}>
                        {id.name}
                      </DropdownItem>
                    ))}
                  </DropdownItemGroup>
                </Dropdown>
              )}
              {stateVal.pidata.length <= 0 && <Select isDisabled placeholder="Loading...." />}
              {stateVal.sprintdata.length > 0 ? (
                <Dropdown
                  triggerButtonProps={{ isDisabled: !stateVal.buttonStatus }}
                  triggerType="button"
                  trigger={(
                    <span>
                      <div className="rightAlign">{stateVal.selectedSprintItems.length === 0 ? 'Select Sprints' : stateVal.selectedSprintItems.toString()}</div>
                    </span>
                  )}
                >
                  <DropdownItemGroupCheckbox id="languages2">
                    <DropdownItemCheckbox
                      isSelected={stateVal.selectedSprintItems.length === stateVal.sprintdata.length}
                      onClick={(event) => this.handleSelectAll('sprint', event)}
                    >
                      Select All
                    </DropdownItemCheckbox>
                    {stateVal.sprintdata.map((id) => (
                      <DropdownItemCheckbox
                        id={id}
                        key={id}
                        isSelected={stateVal.selectedSprintItems.includes(id)}
                        onClick={() => this.handleSelectionSprint(id)}
                      >
                        {id}
                      </DropdownItemCheckbox>
                    ))}
                  </DropdownItemGroupCheckbox>
                </Dropdown>
              ) : (
                <Dropdown trigger={stateVal.sprintLoadingMesg} triggerType="button" triggerButtonProps={{ isDisabled: true }}>
                  <DropdownItemGroupCheckbox id="languages2">
                    <DropdownItemCheckbox> Select Components</DropdownItemCheckbox>
                  </DropdownItemGroupCheckbox>
                </Dropdown>
                )}
              {stateVal.componentdata.length > 0 && stateVal.sprintdata.length ? (
                <Dropdown
                  triggerType="button"
                  triggerButtonProps={{ isDisabled: !stateVal.buttonStatus }}
                  trigger={(
                    <span>
                      <div className="rightAlign">{stateVal.selectedCompItems.length === 0 ? 'Select Components' : stateVal.selectedCompItems.toString()}</div>
                    </span>
                  )}
                >
                  <DropdownItemGroupCheckbox id="languages2">
                    <DropdownItemCheckbox
                      isSelected={stateVal.selectedCompItems.length === stateVal.componentdata.length}
                      onClick={(event) => this.handleSelectAll('component', event)}
                    >
                      Select All
                    </DropdownItemCheckbox>
                    {stateVal.componentdata.map((id) => (
                      <DropdownItemCheckbox
                        id={id}
                        key={id}
                        onClick={(event) => this.handleSelection(id, event)}
                        isSelected={stateVal.selectedCompItems.includes(id)}
                      >
                        {id}
                      </DropdownItemCheckbox>
                    ))}
                  </DropdownItemGroupCheckbox>
                </Dropdown>
              ) : (
                <Dropdown trigger="Select Component" triggerType="button" triggerButtonProps={{ isDisabled: true }}>
                  <DropdownItemGroupCheckbox id="languages2">
                    <DropdownItemCheckbox> Select Components</DropdownItemCheckbox>
                  </DropdownItemGroupCheckbox>
                </Dropdown>
                )}
              <div>
                {!stateVal.buttonStatus || !stateVal.apiCallStatus || stateVal.sprintdetailsdata.length === 0 ? (
                  <Button appearance="primary" isDisabled onClick={this.getFilterVal}>
                    Submit
                  </Button>
                ) : (
                  <Button appearance="primary" onClick={this.getFilterVal}>
                    Submit
                  </Button>
                  )}
              </div>
            </div>
            <div>
              {stateVal.activeSprintData.status && (
                <div className="details-pi heading floatright">
                  <div className="paddfilter">
                    <span>
                      <span className="commonLable">Active Sprint :</span>
                      <span className="aheader">
                        {' '}
                        {stateVal.activeSprintData.sprintName}
                        {' '}
                        [
                        {stateVal.activeSprintData.PIName}
                        ]
                      </span>
                    </span>
                    <span>
                      <span className="">
                        <Tooltip component={InlineDialog} content={cont}>
                          <span className="commonstories cursor">
                            {stateVal.activeSprintData.totalActive > 1 && (
                              <span>
                                +
                                {stateVal.activeSprintData.totalActive - 1}
                                {' '}
                                More Active Sprints
                              </span>
                            )}
                          </span>
                        </Tooltip>
                      </span>
                    </span>
                  </div>
                  <div className="underlinpad">
                    <span className="paddright">
                      <span className="commonLable">Planned : </span>
                      <span className="commonstories">
                        {stateVal.activeSprintData.plannedCapacity}
                        {' '}
                        SP
                        {' '}
                      </span>
                    </span>
                    <span className="paddright">
                      <span className="commonLable comp"> Completed : </span>
                      {' '}
                      <span className="commonstories">
                        {stateVal.activeSprintData.completed}
                        {' '}
                        SP
                        {' '}
                      </span>
                    </span>
                    <span>
                      <span className="commonLable"> Remaining Days : </span>
                      {stateVal.activeSprintData.remainingDay === 0 ? (
                        <span className="storiesrem remred">
                          {stateVal.activeSprintData.remainingDays}
                          {' '}
                          Days
                        </span>
                      ) : (
                        <span className="storiesrem commonstories">{stateVal.activeSprintData.remainingDays}</span>
                        )}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {stateVal.sprintdataStatus && !stateVal.activeSprintData.status && stateVal.activeSprintData.totalActive === '' && (
              <div className="details-pi heading floatright">
                <span className="overWidth paddfiltertop">
                  {stateVal.sprintLoadingMesg === 'No sprints' ? (
                    <span className="aheader">
                      <span>
                        {stateVal.sprintError !== '' ? (
                          <span>
                            There is no proper start/end date for the
                            {' '} 
                            {stateVal.activePIName}
                          </span>
                        ): (
                          <span>
                            Currently there is no sprint available in
                            {' '}
                            {stateVal.activePIName}
                          </span>
                      )}
                      </span>
                    </span>
                  ) : (
                    <span className="aheader">
                      Currently there is no active sprint in
                      {' '}
                      {stateVal.activePIName}
                    </span>
                    )}
                </span>
              </div>
            )}
            {!stateVal.activeSprintData.status && !stateVal.sprintdataStatus && (
              <div className="details-pi heading floatright">
                <span className="overWidth paddfiltertop ">
                  {stateVal.sprintLoadingMesg !== 'No sprints' && <span className="">Please wait while loading ...</span>}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
export default FilterData;
