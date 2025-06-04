import axios from "axios";


export default{
    FETCH_FILES(token){
        console.log("iside fetch files api");
        return axios.get(`/api/site-survey/${token}/`);
    },
    ADD_NEW_ROOF(postData){
        return  axios.post(`api/site-survey/`,postData);
    },
    PATCH_CURRENT_ROOF(token,patchData){
        return axios.patch(`/api/site-survey/${token}/`,patchData);
    }

}