import { createWebHistory, createRouter } from "vue-router";
import homeMap from "@/pages/siteSurvey/homeMap.vue";
import uploadPhotos from "@/pages/siteSurvey/uploadPhotos.vue";
import uploadVideos from "@/pages/siteSurvey/uploadVideos.vue";
import homePage from "@/pages/siteSurvey/homePage.vue";
import allRoofs from "@/pages/siteSurvey/allRoofs.vue";
import filesUploadSuccessfully from "@/pages/siteSurvey/filesUploadSuccessfully.vue";
import Studio from "@/pages/studio/studio.vue";
import reportSummary from "@/pages/studio/reportSummary.vue";
import checklistLoading from "./pages/studio/checklistLoading.vue";
import waaree from "./pages/waaree/waaree.vue";
import solarkMarketingPortal from "./pages/solarkMarketingPortal/solarkMarketingPortal.vue";
import systemConfigRouteFile from "./pages/solarkMarketingPortal/components/systemConfigRouteFile.vue";
import solarkMarketingPortal2 from "./pages/solarMarketingPortal2/solarkMarketingPortal.vue";
import solarkReport from "./pages/solarMarketingPortal2/solarkReport.vue";
import siteSurvey from "./pages/editableSiteSurvey/index.vue";
import proposalTemplateReport from "./pages/studio/proposalTemplateReportComponents/proposalTemplateReport.vue";
import { addThirdPartyRoutes } from "./constants";
import formSubmission from "./pages/editableSiteSurvey/components/formSubmission.vue";
import solarCalculator from "./pages/solarCalculator/index.vue";

const url = window.location.hostname;
console.log(url);
const initialName = url.split(".")[0];
console.log(initialName);
let home;
if (initialName === "waareetest") {
  home = waaree;
} else if (initialName == "solarcalculator" || initialName == "tatapowersolar-calculator") {
  home = solarCalculator;
} else {
  home = homePage;
}
const routes = [
  {
    path: "/",
    name: "homePage",
    component: home,
  },
  {
    path: "/siteSurvey2",
    name: "siteSurvey",
    component: siteSurvey,
  },
  {
    path: "/studio",
    name: "studio",
    component: Studio,
  },
  {
    path: "/reportSummary",
    name: "reportSummary",
    component: reportSummary,
  },
  {
    path: "/test",
    name: "test",
    component: checklistLoading,
  },
  {
    path: "/reportSuccess",
    name: "reportSuccess",
    component: filesUploadSuccessfully,
  },
  {
    path: "/:referenceID/:templateID",
    name: "siteSurvey",
    component: siteSurvey,
  },
  {
    path: "/siteSurveyPreview/:templateID",
    name: "siteSurveyPreview",
    component: siteSurvey,
  },
  {
    path: "/:referenceID/formSubmission",
    name: "formSubmission",
    component: formSubmission,
  },
  {
    path: "/:referenceID/editNotAllowed",
    name: "editNotAllowed",
    component: formSubmission,
  },
  {
    path: "/map",
    name: "homeMap",
    component: homeMap,
  },
  {
    path: "/map/:referenceID",
    name: "homeMapRef",
    component: homeMap,
  },
  {
    path: "/map/:referenceID/:roofNo",
    name: "homeMapWithRoofNo",
    component: homeMap,
  },
  {
    path: "/mapForDesignTool",
    name: "mapForDesignTool",
    component: homeMap,
  },
  {
    path: "/uploadPhotos",
    name: "uploadPhotos",
    component: uploadPhotos,
  },
  {
    path: "/uploadPhotos/:referenceID",
    name: "uploadPhotosRef",
    component: uploadPhotos,
  },
  {
    path: "/uploadPhotos/:referenceID/:roofNo",
    name: "uploadPhotosWithRoofNo",
    component: uploadPhotos,
  },
  {
    path: "/uploadVideos",
    name: "uploadVideos",
    component: uploadVideos,
  },
  {
    path: "/uploadVideos/:referenceID",
    name: "uploadVideosRef",
    component: uploadVideos,
  },
  {
    path: "/uploadVideos/:referenceID/:roofNo",
    name: "uploadVideosWithRoofNo",
    component: uploadVideos,
  },
  {
    path: "/allRoofs",
    name: "allRoofs",
    component: allRoofs,
  },
  {
    path: "/allRoofs/:referenceID",
    name: "allRoofsRef",
    component: allRoofs,
  },
  {
    path: "/filesUploadSuccessfully",
    name: "filesUploadSuccessfully",
    component: filesUploadSuccessfully,
  },
  {
    path: "/proposalTemplate",
    name: "proposalTemplate",
    component: proposalTemplateReport,
  },
  {
    path: "/solarCalculator",
    name: "solarCalculator",
    component: solarCalculator,
  },
];

if (addThirdPartyRoutes) {
  routes.push(
    {
      path: "/waaree",
      name: "waaree",
      component: waaree,
    },
    {
      path: "/solarkMarketingPortal",
      name: "solarkMarketingPortal",
      component: solarkMarketingPortal2,
    },
    {
      path: "/solarkMarketingPortal2",
      name: "solarkMarketingPortal2",
      component: solarkMarketingPortal2,
    },
    {
      path: "/solarkReport",
      name: "solarkReport",
      component: solarkReport,
    },
    {
      path: "/systemConfigRouteFile",
      name: "systemConfigRouteFile",
      component: systemConfigRouteFile,
    }
  );
}

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
