import moment from 'moment';
/**
 * Description: Class used to handle the date releated common funcion
 * Author: Baskar.V.P
 * Date: 23-06-2020
 */
class CommonDateFunction {
  /**
   * Method: Following Method is used to get the no of dates between two dates
   * Author: Baskar.V.P
   * Date: 16-06-2020
   * */
  getDaysBetweenDates = (startDate, stopDate) => {
    const dateArray = [];
    let currentDate = moment(startDate);
    const stopDateVal = moment(stopDate);
    while (currentDate <= stopDateVal) {
      dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
      currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
  };

  compareDates = (firstDate, secondDate) => {
    const firstDateFor = moment(firstDate).format('YYYY-MM-DD');
    return moment(firstDateFor).isSame(secondDate, 'day'); // true or false
  };

  compareDatesisSameorBefore = (firstDate, secondDate) => {
    const firstDateFor = moment(firstDate).format('YYYY-MM-DD');
    return moment(firstDateFor).isSameOrBefore(secondDate); // true or false
  };

  compareDatesisSameorAfter = (firstDate, secondDate) => {
    const firstDateFor = moment(firstDate).format('YYYY-MM-DD');
    return moment(firstDateFor).isSameOrAfter(secondDate); // true or false
  };

  getNoofDaysBetween = (startDateVal, endDateVal) => {
    const todayDate = moment(moment(startDateVal).format('YYYY-MM-DD'), 'YYYY-MM-DD');
    const endDate = moment(moment(endDateVal).format('YYYY-MM-DD'), 'YYYY-MM-DD');
    return endDate.diff(todayDate, 'days');
  };

  getMaxDate = (dates) => {
    /* eslint func-names: ["error", "never"] */
    const maxDate = dates.map(function (dat) {
      return moment(dat, 'YYYY-MM-DD');
    });
    return moment.max(maxDate).format('YYYY-MM-DD');
  };

  getMinDate = (dates) => {
    /* eslint func-names: ["error", "never"] */
    const mindate = dates.map(function (dat) {
      return moment(dat, 'YYYY-MM-DD');
    });
    return moment.min(mindate).format('YYYY-MM-DD');
  };

  getDayofWeek = (date) => {
    return moment(date).day();
  };

  getFormatDated = (dates) => {
    const totalDate = dates.map(function (dat) {
      return moment(dat).format('MMM-DD');
    });
    return totalDate;
  };

  calculateBusinessDays = (firstDate, secondDate) => {
    const firstDates = moment(`${firstDate}T00:00`).format();
    const secondDates = moment(`${secondDate}T23:00`).format();
    // EDIT : use of startOf
    let day1 = moment(firstDates).startOf('day');
    let day2 = moment(secondDates).startOf('day');
    // EDIT : start at 1
    let adjust = 1;

    if (day1.dayOfYear() === day2.dayOfYear() && day1.year() === day2.year()) {
      return 0;
    }

    if (day2.isBefore(day1)) {
      const temp = day1;
      day1 = day2;
      day2 = temp;
    }

    // Check if first date starts on weekends
    if (day1.day() === 6) {
      // Saturday
      // Move date to next week monday
      day1.day(8);
    } else if (day1.day() === 0) {
      // Sunday
      // Move date to current week monday
      day1.day(1);
    }

    // Check if second date starts on weekends
    if (day2.day() === 6) {
      // Saturday
      // Move date to current week friday
      day2.day(5);
    } else if (day2.day() === 0) {
      // Sunday
      // Move date to previous week friday
      day2.day(-2);
    }

    const day1Week = day1.week();
    let day2Week = day2.week();

    // Check if two dates are in different week of the year
    if (day1Week !== day2Week) {
      // Check if second date's year is different from first date's year
      if (day2Week < day1Week) {
        day2Week += day1Week;
      }
      // Calculate adjust value to be substracted from difference between two dates
      // EDIT: add rather than assign (+= rather than =)
      adjust += -2 * (day2Week - day1Week);
    }
    return day2.diff(day1, 'days') + adjust;
  };

  getChangeFormat = (date) => {
    return moment(date).format('YYYY-MM-DD');
  };
}
export default CommonDateFunction;
