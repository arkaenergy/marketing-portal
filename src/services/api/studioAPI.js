import axios from "axios";

export default{
    CREATE_LEAD(postData) {
        return axios.post(`/api/lead/`, postData);
    },
    PATCH_LEAD(id, postData) {
        return axios.patch(`/api/lead/${id}/`, postData);
    },
    GET_FINANCIAL_DATA(id, postData) {
        return axios.post(`/api/lead/${id}/financial_data/`, postData);
    },
    SEND_EMAIL(postData){
        return axios.post(`/lead/send_email`,postData);
    },
    FETCH_STUDIO_REPORT_INFO(lead_id){
        return axios.get(`/api/solar-report/?query=new&lead=${lead_id}`);
    },
    // GMaps get json API
    GET_GMAPS_JSON(qParams){
        let options = { params: qParams };

        return axios.get(`/api/master_data/google_geocode`,options);
    }
}