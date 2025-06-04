import axios from "axios";
import API from "@/services/api";

let PRODUCTION_ENV = true;
let sasToken;
let containerName = CONTAINER_NAME;
let storageAccountName = `downloadtsl`;
let isRnelDomain = false;

// Importing all the services
import imagesAndVideos from "./imagesAndVideos";
import sasTokenAPI from "./sasTokenAPI";
import studioAPI from "./studioAPI";
import solark from "./solark";
import solarCalculator from "./solarCalculator";
import editableSiteSurvey from "./editableSiteSurvey";
import wareeAPI from "./waareeAPI";
import { DATABASE_URL, CONTAINER_NAME } from "../../constants";

let GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
export { GOOGLE_API_KEY };

if (location.hostname.includes("rnel")) {
  isRnelDomain = true;
}

export default {
  IMAGES_AND_VIDEOS: imagesAndVideos,
  SAS_TOKEN_API: sasTokenAPI,
  STUDIO_API: studioAPI,
  SOLARK: solark,
  EDITABLE_SITE_SURVEY_API: editableSiteSurvey,
  SOLARCALCULATOR: solarCalculator,
  WAREE: wareeAPI,
  SET_DATABASE_URL() {
    axios.defaults.baseURL = DATABASE_URL;
  },
  async UPDATE_SAS_TOKEN() {
    const response = await API.SAS_TOKEN_API.FETCH_AND_SET_SAS_TOKEN();
    sasToken = response.data["sas_token"];
  },
};

export { sasToken, containerName, storageAccountName, isRnelDomain };
