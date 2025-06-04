<template>
  <div class="parentContainerSolark" v-loading="isLoading">
    <div class="commonNavbar">
      <img
        src="../solarkMarketingPortal/assets/img/Sol-Ark-Logo.png"
        class="navIcon"
      />
    </div>
    <HomePage
      v-if="currentPageNumber == 1 && !isLoading"
      @pageNumberAfterNext="pageNumberAfterNext"
      @pageNumberAfterBack="pageNumberAfterBack"
      @reset="reset"
    />
    <SolarAndBackupGoal
      v-if="currentPageNumber == 2 && !isLoading"
      @pageNumberAfterNext="pageNumberAfterNext"
      @pageNumberAfterBack="pageNumberAfterBack"
      @reset="reset"
    />
    <Recommendations
      v-if="currentPageNumber == 3 && !isLoading"
      @pageNumberAfterNext="pageNumberAfterNext"
      @pageNumberAfterBack="pageNumberAfterBack"
      @reset="reset"
    />
  </div>
</template>

<script>
import API from "@/services/api";
import HomePage from "./components/homePage.vue";
import Recommendations from "./components/recommendations.vue";
import SolarAndBackupGoal from "./components/solarAndBackupGoal.vue";
export default {
  components: {
    HomePage,
    Recommendations,
    SolarAndBackupGoal,
  },
  async created() {
    this.isLoading = true;
    this.fetchOrAssignDefaultPageStatus();
    await this.getAllAppliancesInfo(false);
    this.initializeJSONToSend();
    this.storeDefaultAppliancesInLS();
    this.isLoading = false;
  },
  mounted() {},
  data() {
    return {
      currentPageNumber: 1,
      isAlreadyReset: null,
      isLoading: false,
    };
  },
  methods: {
    pageNumberAfterNext(pageNo) {
      this.currentPageNumber = pageNo;
      this.changePageNoinLS(pageNo);
    },
    pageNumberAfterBack(pageNo) {
      this.currentPageNumber = pageNo;
      this.changePageNoinLS(pageNo);
    },
    mappingApplianceIdToJSON(allincomingApplianceList) {
      let idMappingWithJSON = {};
      for (let i = 0; i < allincomingApplianceList.length; i++) {
        idMappingWithJSON[allincomingApplianceList[i]["id"]] =
          allincomingApplianceList[i];
      }
      if (!localStorage.getItem("id-mapping-appliances"))
        localStorage.setItem(
          "id-mapping-appliances",
          JSON.stringify(idMappingWithJSON)
        );
    },
    async getAllAppliancesInfo(isReset) {
      let allIncomingAppliances = JSON.parse(
        localStorage.getItem("all-incoming-appliances")
      );
      //Make a call only if the reset button has been clicked
      //or if the localstorage "all-incoming-appliances" is null (i.e, the first page load on created)
      //on subsequent reloads, the call won't happen
      if (isReset || !allIncomingAppliances) {
        let response = await API.SOLARK.FETCH_ALL_APPLIANCES_INFO();
        localStorage.setItem(
          "all-incoming-appliances",
          JSON.stringify(response.data)
        );
        let allincomingApplianceList = response.data;
        this.modifyEVJson();
      }
    },
    modifyEVJson() {
      let allIncomingAppliances = JSON.parse(
        localStorage.getItem("all-incoming-appliances")
      );
      let findIndexOfEv = allIncomingAppliances.findIndex((item) => {
        return item.id == 10;
      });
      if (findIndexOfEv >= 0) {
        allIncomingAppliances[findIndexOfEv].final_consumption = 10;
      }
      localStorage.setItem(
        "all-incoming-appliances",
        JSON.stringify(allIncomingAppliances)
      );
      this.mappingApplianceIdToJSON(allIncomingAppliances);
    },
    initializeJSONToSend() {
      let jsonToSend = {
        typeOfUser: "I’m the homeowner",
        otherUserValue: "",
        center: {
          lat: 37.78454178741125,
          lng: -122.4037594380287,
        },
        state: "California",
        address: "",
        zoom: 19,
        avgMonthlyBill: 250,
        avgMontlyEngConsump: null,
        homeAreaSq: 3000,
        userLookingFor: "Solar with Battery",
        hoursOfBackup: 16,
        final_critical_list: [],
        final_total_appliances: [],
        optimal_usage_appliances: [],
        batteryLocation: "Indoor",
        energyStorageFeatures: ["Heated", "California"],
        selectedConsumptionPattern: "Nighttime focused consumption",
        mainPanelRating: 200,
        selectedInverterType: "Recommended Option",
        selectedBatteryType: "Recommended Option",
        upgradedOptionInverterTypeValue: 5,
      };
      if (!localStorage.getItem("jsonToSendForCalculation"))
        localStorage.setItem(
          "jsonToSendForCalculation",
          JSON.stringify(jsonToSend)
        );
    },
    storeDefaultAppliancesInLS() {
      // store all appliances <= 1KW of load to total(owned) and critical appliances
      let allIncomingAppliances = JSON.parse(
        localStorage.getItem("all-incoming-appliances")
      );
      // let defaultAppliances = allIncomingAppliances.filter((item) => {
      //   return Number(item.default_load_kw) <= 1;
      // });
      const ownAppliancesIds = [1,3,6,33,35,36,37,38];
      let defaultAppliancesOwn = allIncomingAppliances.filter((item) => {
        return ownAppliancesIds.includes(item.id);
      });
      //console.log("own",defaultAppliancesOwn);
      const backupAppliancesIds = [6,33,36,37,38];
      let defaultAppliancesBackup = allIncomingAppliances.filter((item) => {
        return backupAppliancesIds.includes(item.id);
      });
      //console.log("backup",defaultAppliancesBackup);
      let jsonToSend = JSON.parse(
        localStorage.getItem("jsonToSendForCalculation")
      );
      let final_critical_list = jsonToSend["final_critical_list"];
      let final_total_appliances = jsonToSend["final_total_appliances"];
      if (
        final_critical_list.length == 0 &&
        final_total_appliances.length == 0
      ) {
        // It means first time appliances are setting to default
        jsonToSend["final_critical_list"] = [...defaultAppliancesBackup];
        jsonToSend["final_total_appliances"] = [...defaultAppliancesOwn];
        localStorage.setItem(
          "jsonToSendForCalculation",
          JSON.stringify(jsonToSend)
        );
      }
    },
    fetchOrAssignDefaultPageStatus() {
      let pageStatus = JSON.parse(localStorage.getItem("page-status"));
      if (pageStatus) {
        this.currentPageNumber = pageStatus.pageNumber;
        this.isAlreadyReset = pageStatus.isAlreadyReset;
        return;
      }
      pageStatus = {
        isAlreadyReset: true,
        pageNumber: 1,
      };
      localStorage.setItem("page-status", JSON.stringify(pageStatus));
    },
    changePageNoinLS(pageNo) {
      let pageStatus = JSON.parse(localStorage.getItem("page-status"));
      pageStatus.pageNumber = pageNo;
      pageStatus.isAlreadyReset = false;
      localStorage.setItem("page-status", JSON.stringify(pageStatus));
    },
    resetPageStatus() {
      let pageStatus = {
        isAlreadyReset: true,
        pageNumber: 1,
      };
      localStorage.setItem("page-status", JSON.stringify(pageStatus));
      this.currentPageNumber = 1;
      this.isAlreadyReset = true;
    },
    async reset() {
      this.isLoading = true;
      this.clearLocalStorage();
      this.resetPageStatus();
      await this.getAllAppliancesInfo(true);
      this.initializeJSONToSend();
      this.storeDefaultAppliancesInLS();
      this.isLoading = false;
    },
    clearLocalStorage() {
      localStorage.removeItem("jsonToSendForCalculation");
      localStorage.removeItem("all-incoming-appliances");
      localStorage.removeItem("id-mapping-appliances");
      localStorage.removeItem("page-status");
      localStorage.removeItem("userInfo");
    },
  },
  computed: {},
  watch: {},
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Poppins:wght@300;400;600&display=swap");

.parentContainerSolark {
}

.commonNavbar {
  height: 96px;
  padding: 16px 32px;
  background-color: #fff;
  box-shadow: 0px 1px 10px 0px #00000040;
}

p,
span,
div,
h1,
h2,
h3,
h4,
button,
a {
  font-family: "Poppins";
}
</style>
