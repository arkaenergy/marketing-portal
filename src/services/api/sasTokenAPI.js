import axios from "axios";
import { CONTAINER_NAME } from "@/constants";

export default{
    FETCH_AND_SET_SAS_TOKEN(){
        const postData = {
            "container": CONTAINER_NAME
        }
        return  axios.post(`/api/documents/generate-sas-token-minimal`,postData);   
    },
}