import axios from "axios";

export default {

  GET_BASIC_FORM_TEMPLATE(id) {
    return axios.get(`/api/template/${id}/`);
  },

  CALCULATE_SOLAR_DATA(data) {
    return axios.post("/api/lead/financial_data/", data);
  },

  LEAD_CAPTURE_API(data) {
    return axios.post("/api/lead/", data);
  },

  SEND_OTP(postData) {
    return axios.post(`api/lead/send_otp/`, postData);
  },
  VERIFY_OTP(postData) {
    return axios.post(`api/lead/verify_otp/`, postData);
  },
};
