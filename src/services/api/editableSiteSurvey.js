import axios from 'axios'

export default{
    FETCH_QUESTIONS(templateID) {
        return axios.get(`/api/template/${templateID}/`)
    },
    PATCH_ANSWERS(patchData) {
        return axios.post(`/api/answers/`,patchData)
    },
    FETCH_ANSWERS(referenceId) {
        return axios.get(`api/answers/?site_survey=${referenceId}`);
    },

    //corner patch for file upload and even to delete files for a corner
    PATCH_CORNER(corner_id, data){
        return axios.patch(`api/corner/${corner_id}/`,data);
    },
    PATCH_PATH(path_id, data){
        return axios.patch(`api/path/${path_id}/`,data);
    },
    DELETE_CORNER(cornerId){
        return axios.delete(`api/corner/${cornerId}/`);
    },
    DELETE_PATH(pathId){
        return axios.delete(`api/path/${pathId}/`);
    },
    SUBMIT_SITE_SURVEY(token,patchData){
        return axios.patch(`/api/site-survey/${token}/`,patchData);
    },
    FETCH_SITE_SURVEY(token){
        return axios.get(`/api/site-survey/${token}/`)
    },
    DELETE_ALL_CORNERS(cornerId,answerId){
        return axios.delete(`api/corner/${cornerId}/?answer=${answerId}`);
    },
    DELETE_NESTED_FILE(fileObj){
        return axios.post(`api/answers/delete-from-container/`,fileObj);
    }
}