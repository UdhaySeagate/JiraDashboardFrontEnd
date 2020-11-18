import axios from 'axios';
import * as URL from './configURL';
/**
 * Description: Class used to handle the service call to third party api
 * Author: Baskar.V.P
 * Date: 15-06-2020
 */
class ApiServiceCall {
  /**
   * Method: Following Method is used to handle the service based on url
   * Author: Baskar.V.P
   * Date: 16-06-2020
   * */

  callApiServiceMethod = (urlParam, paramData) => {
    // Make a request for a user with a given ID
    const url = URL[urlParam];
    return (
      axios({
        method: 'get',
        url,
        params: paramData
      })
        /* eslint func-names: ["error", "never"] */
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          // handle error
          return error;
        })
        .finally(function () {
          // always executed
        })
    );
  };

  callMutliApicall = (urlsarr, paramsarr) => {
    const issueapi = axios({
      method: 'get',
      url: URL[urlsarr[0]],
      params: paramsarr[0]
    });
    return axios
      .all([issueapi])
      .then(
        axios.spread((...responses) => {
          return responses;
        })
      )
      .catch((errors) => {
        // react on errors.
        return errors;
      });
  };
}

export default ApiServiceCall;
