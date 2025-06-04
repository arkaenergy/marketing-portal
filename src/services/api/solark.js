import axios from "axios";


export default{
  FETCH_ALL_APPLIANCES_INFO(){
    return axios.get(`/api/appliances/`);
  },

  FETCH_ADDITIONAL_INFO(){
    return axios.get(`/api/solar-cal-additonal-detail/`);
  },
  FETCH_CALCULATION(payload){
    return axios.post(`/api/solar_calculation/`, payload );
  },

  POST_USER_DETAILS_INFO(postData) {
    return axios.post(`/api/lead/`, postData);
  },
  FETCH_SELECTED_BATTERIES_LIST(selectedBattery){
    return axios.get(`/api/fetch_battery/?manufacturer=${selectedBattery}`);
  },
  CREATE_OR_PATCH_SOLARK_REPORT(postData){
    return axios.post(`/api/solar-report/create_or_update/`, postData);
  },
  FETCH_SOLARK_REPORT_INFO(email){
    return axios.get(`/api/solar-report/?email=${email}`);
  }

}
