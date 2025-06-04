import axios from "axios";

export default{
    SEND_OTP(postData) {
        return axios.post(`api/lead/send_otp/`, postData);
    },
    VERIFY_OTP(postData) {
        return axios.post(`api/lead/verify_otp/`, postData);
    },
    GET_FINANCIAL_DATA(leadId,postData) {
        return axios.post(`api/lead/${leadId}/financial_data/`, postData);
    },
    CREATE_LEAD(postData) {
        return axios.post(`api/lead/`, postData);
    }
}