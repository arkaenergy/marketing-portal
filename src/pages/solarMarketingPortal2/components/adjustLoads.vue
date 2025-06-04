<template>
  <div class="adjustable-loads">
    <section class="loads-header">
      <span class="link" @click="openCreateAppliance = true"
        >+ Add New Appliances</span
      >
    </section>
    <!-- create appliance -->
    <GlobalDialog
      :dialogVisible="openCreateAppliance"
      :width="'45%'"
      :requireFooterButtons="false"
      @handleClick="openCreateAppliance = false"
      @handleClose="openCreateAppliance = false"
    >
      <template v-slot:body>
        <CreateAppliance :mode="'create'" @addNewAppliance="addNewAppliance"
      /></template>
    </GlobalDialog>
    <!-- end create appliance -->
    <!-- edit appliance -->
    <GlobalDialog
      :dialogVisible="openEditAppliance"
      :width="'45%'"
      :requireFooterButtons="false"
      @handleClick="openEditAppliance = false"
      @handleClose="openEditAppliance = false"
    >
      <template v-slot:body>
        <CreateAppliance
          :mode="'edit'"
          @updateAppliance="updateApplianceDetails"
          :applianceToBeEdited="applianceToBeEdited"
      /></template>
    </GlobalDialog>
    <!-- end edit appliance -->
    <section class="loads-body">
      <AppliancesCard
        :heading="'Small Appliances'"
        :appliancesList="smallAppliances"
        @openEditAppliance="handleOpenEditAppliance"
        @updateAppliance="updateApplianceDetails"
      />
      <AppliancesCard
        :heading="'Large Appliances'"
        :appliancesList="largeAppliances"
        @openEditAppliance="handleOpenEditAppliance"
        @updateAppliance="updateApplianceDetails"
      />
      <AppliancesCard
        :heading="'Heavy Appliances'"
        :appliancesList="heavyAppliances"
        @openEditAppliance="handleOpenEditAppliance"
        @updateAppliance="updateApplianceDetails"
      />
      <AppliancesCard
        v-show="newAppliances.length > 0"
        :heading="'New Appliances'"
        :appliancesList="newAppliances"
        @openEditAppliance="handleOpenEditAppliance"
        @updateAppliance="updateApplianceDetails"
        @addNewAppliance="openCreateAppliance = true"
      />
    </section>

    <section class="loads-footer">
      <el-button
        class="cancel-button button-text"
        @click="handleCloseAdjustLoads"
        >Cancel</el-button
      >
      <el-button
        class="update-button button-text"
        type="primary"
        @click="updateLocalStorageLoads"
        >Update</el-button
      >
    </section>
  </div>
</template>

<script>
import AppliancesCard from "./loadControl/appliancesCard.vue";
import CreateAppliance from "./loadControl/createAppliance.vue";
import GlobalDialog from "./globalDialog.vue";
import { v4 } from "uuid";
export default {
  components: {
    AppliancesCard,
    GlobalDialog,
    CreateAppliance,
  },
  data() {
    return {
      // smallAppliances: [
      //   {
      //     id: 1,
      //     own: false,
      //     name: "Refrigerator",
      //     optimalUsage: false,
      //     backup: true,
      //     quantity: 0,
      //     type: "small",
      //   },
      //   {
      //     id: 2,
      //     own: false,
      //     name: "Laptop/ Home PC",
      //     optimalUsage: false,
      //     backup: true,
      //     quantity: 0,
      //     type: "small",
      //   },
      //   {
      //     id: 3,
      //     own: false,
      //     name: "Television",
      //     optimalUsage: false,
      //     backup: true,
      //     quantity: 0,
      //     type: "small",
      //   },
      // ],
      // largeAppliances: [
      //   {
      //     id: 7,
      //     own: false,
      //     name: "Gas Cook Top (Stove)",
      //     optimalUsage: false,
      //     backup: true,
      //     quantity: 0,
      //     type: "large",
      //   },
      //   {
      //     id: 8,
      //     own: false,
      //     name: "Gas Oven",
      //     optimalUsage: false,
      //     backup: true,
      //     quantity: 0,
      //     type: "large",
      //   },
      //   {
      //     id: 9,
      //     own: false,
      //     name: "Oven",
      //     optimalUsage: false,
      //     backup: false,
      //     quantity: 0,
      //     type: "large",
      //   },
      // ],
      // heavyAppliances: [
      //   {
      //     id: 23,
      //     own: false,
      //     name: "EV",
      //     optimalUsage: false,
      //     backup: false,
      //     quantity: 0,
      //     type: "heavy",
      //   },
      //   {
      //     id: 24,
      //     own: false,
      //     name: "Boat Lift Motor",
      //     optimalUsage: false,
      //     backup: false,
      //     quantity: 0,
      //     type: "heavy",
      //   },
      //   {
      //     id: 25,
      //     own: false,
      //     name: "Elevator",
      //     optimalUsage: false,
      //     backup: false,
      //     quantity: 0,
      //     type: "heavy",
      //   },
      // ],
      smallAppliances: [],
      largeAppliances: [],
      heavyAppliances: [],
      newAppliances: [],
      openCreateAppliance: false,
      openEditAppliance: false,
      applianceToBeEdited: {},
      isCriticalBool: {},
      isOwnedBool: {},
      isOptimalBool: {},
    };
  },
  created() {
    //retreiving from local storage
    const storedData = localStorage.getItem("jsonToSendForCalculation");
    const applianceList = localStorage.getItem("all-incoming-appliances");

    const calcObject = storedData ? JSON.parse(storedData) : "";
    const applianceListObject = applianceList ? JSON.parse(applianceList) : "";
    //console.log("hello",calcObject);
    //console.log(applianceListObject);

    //creating boolean JSONs
    const isCritical = this.createBooleanJSONS(calcObject.final_critical_list);
    const isOwned = this.createBooleanJSONS(calcObject.final_total_appliances);
    const isOptimal = this.createBooleanJSONS(
      calcObject.optimal_usage_appliances
    );
    // console.log(isCritical);
    // console.log(isOwned);
    // console.log(isOptimal);
    this.isCriticalBool = isCritical;
    this.isOwnedBool = isOwned;
    this.isOptimalBool = isOptimal;

    //creating new list of appliances with added properties of own, backup, optimalUsage
    const updatedAppliances = this.addBooleanProperties(applianceListObject);
    console.log("added new properties", updatedAppliances);
    //categorise lists into SMALL, LARGE, HEAVY and NEW

    const segregatedLists = this.segregateAppliancesByLoadKw(updatedAppliances);

    // console.log("Small Appliances:", segregatedLists.smallAppliances);
    // console.log("Large Appliances:", segregatedLists.largeAppliances);
    // console.log("Heavy Appliances:", segregatedLists.heavyAppliances);
    // console.log("Heavy Appliances:", segregatedLists.newAppliances);

    this.smallAppliances = segregatedLists.smallAppliances;
    this.largeAppliances = segregatedLists.largeAppliances;
    this.heavyAppliances = segregatedLists.heavyAppliances;
    this.newAppliances = segregatedLists.newAppliances;
  },
  methods: {
    //preprocessing appliances

    createBooleanJSONS(appliances) {
      const appliancePresence = {};

      for (const appliance of appliances) {
        const { id } = appliance;
        appliancePresence[id] = true;
      }

      return appliancePresence;
    },

    addBooleanProperties(appliances) {
      const updatedAppliances = [];

      for (const appliance of appliances) {
        const { id } = appliance;
        const updatedAppliance = {
          ...appliance,
          own: this.isOwnedBool[id] ? this.isOwnedBool[id] : false,
          backup: this.isCriticalBool[id] ? this.isCriticalBool[id] : false,
          optimalUsage: this.isOptimalBool[id] ? this.isOptimalBool[id] : false,
        };
        updatedAppliances.push(updatedAppliance);
      }

      return updatedAppliances;
    },

    segregateAppliancesByLoadKw(appliances) {
      const smallAppliances = [];
      const largeAppliances = [];
      const heavyAppliances = [];
      const newAppliances = [];

      for (const appliance of appliances) {
        const defaultLoadKw = parseFloat(appliance.default_load_kw);

        if (appliance.type === "new") {
          appliance.type = "new";
          newAppliances.push(appliance);
        } else {
          if (defaultLoadKw <= 1) {
            appliance.type = "small";
            smallAppliances.push(appliance);
          } else if (defaultLoadKw > 1 && defaultLoadKw <= 5) {
            appliance.type = "large";
            largeAppliances.push(appliance);
          } else {
            appliance.type = "heavy";
            heavyAppliances.push(appliance);
          }
        }
      }

      return {
        smallAppliances,
        largeAppliances,
        heavyAppliances,
        newAppliances,
      };
    },

    updateLocalStorageLoads() {
      console.log("update local storage");
      //iterate through small, large, heavy and new
      let owned_appliances = [];
      let backup_appliances = [];
      let optimal_usage_appliances = [];
      let total_appliances = [];
      console.log(this.smallAppliances);
      for (let appliance of this.smallAppliances) {
        if (appliance.own) owned_appliances.push(appliance);
        if (appliance.backup) backup_appliances.push(appliance);
        if (appliance.optimalUsage) optimal_usage_appliances.push(appliance);
        total_appliances.push(appliance);
      }
      for (let appliance of this.largeAppliances) {
        if (appliance.own) owned_appliances.push(appliance);
        if (appliance.backup) backup_appliances.push(appliance);
        if (appliance.optimalUsage) optimal_usage_appliances.push(appliance);
        total_appliances.push(appliance);
      }
      for (let appliance of this.heavyAppliances) {
        if (appliance.own) owned_appliances.push(appliance);
        if (appliance.backup) backup_appliances.push(appliance);
        if (appliance.optimalUsage) optimal_usage_appliances.push(appliance);
        total_appliances.push(appliance);
      }
      for (let appliance of this.newAppliances) {
        if (appliance.own) owned_appliances.push(appliance);
        if (appliance.backup) backup_appliances.push(appliance);
        if (appliance.optimalUsage) optimal_usage_appliances.push(appliance);
        total_appliances.push(appliance);
      }
      //Move updated lists into Local storage
      console.log("total", total_appliances);
      console.log("own", owned_appliances);
      console.log("backup", backup_appliances);
      console.log("optimal", optimal_usage_appliances);

      const appliancesJSON = JSON.stringify(total_appliances);
      localStorage.setItem("all-incoming-appliances", appliancesJSON);

      let jsonToSend = JSON.parse(
        localStorage.getItem("jsonToSendForCalculation")
      );
      jsonToSend["final_critical_list"] = backup_appliances;
      jsonToSend["final_total_appliances"] = owned_appliances;
      jsonToSend["optimal_usage_appliances"] = optimal_usage_appliances;
      localStorage.setItem(
        "jsonToSendForCalculation",
        JSON.stringify(jsonToSend)
      );
      this.$emit("closeAdjustLoads", true); // to indicate that this is an update
    },
    addNewAppliance(data) {
      console.log(data);
      //make CREATE API call, get response, id
      //format response object accordingly
      //and append to newAppliances list
      const uuid = v4();
      this.newAppliances.push({
        id: uuid,
        own: false,
        name: data.name,
        optimalUsage: false,
        backup: false,
        quantity: data.quantity,
        type: "new",
        default_load_kw: data.default_load_kw,
        operating_hour: data.operating_hour,
      });
      console.log(this.newAppliances);
      this.openCreateAppliance = false;
    },
    handleOpenEditAppliance(data, index) {
      this.openEditAppliance = true;
      //update appliance object with details and pass
      //maybe do a fetch for the power and daily usage
      console.log("APPLIANCE TO EDIT", data);
      this.applianceToBeEdited = {
        id: data.id,
        quantity: data.quantity,
        operating_hour: data.operating_hour,
        default_load_kw: data.default_load_kw,
        type: data.type,
        index: index,
      };
    },
    updateApplianceDetails(data, index) {
      //this method gets called for edit appliance card
      //or when user toggles ownership of an appliance
      //or when user toggles backup/optimal usage for an appliance
      console.log("updating in parent");
      console.log(data);
      console.log(index);

      //replace the corresponding object in the REQUIRED APPLIANCE list
      let updatedAppliance;
      if (data.type === "small") {
        console.log("small");
        updatedAppliance = this.smallAppliances[index];
      }
      if (data.type === "large") {
        updatedAppliance = this.largeAppliances[index];
      }
      if (data.type === "heavy") {
        updatedAppliance = this.heavyAppliances[index];
      }
      if (data.type === "new") {
        updatedAppliance = this.newAppliances[index];
      }
      if (data.quantity) {
        updatedAppliance.quantity = parseInt(data.quantity);
        updatedAppliance.operating_hour = data.operating_hour;
        updatedAppliance.default_load_kw = data.default_load_kw;
      }
      if (data.own) {
        updatedAppliance.own = data.own;
      }
      if (data.backup) {
        updatedAppliance.backup = data.backup;
      }
      if (data.optimalUsage) {
        updatedAppliance.optimalUsage = data.optimalUsage;
      }
      this.openEditAppliance = false;
      console.log(this.smallAppliances);
      console.log(this.largeAppliances);
      console.log(this.heavyAppliances);
      console.log(this.newAppliances);
    },
    handleCloseAdjustLoads() {
      this.$emit("closeAdjustLoads", false); //indicate this is cancel close
    },
  },
};
</script>

<style scoped>
* {
  font-family: "Poppins";
}

.loads-header {
  display: flex;
  justify-content: flex-end;
}

.link {
  color: #184d93;
  font-size: 1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.625rem;
  cursor: pointer;
}

/* Footer buttons styling*/
.loads-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  /*For sticky footer buttons section*/
  position: sticky;
  bottom: 0;
  background-color: #fff; /* Optional: Set a background color for the footer */
  z-index: 1; /* Optional: Set a z-index to control the stacking order */
  padding: 1rem 0;
}

/*For sticky footer buttons section start*/
.loads-body {
  flex: 1; /* Allow the loads-body to occupy the remaining available space */
  overflow-y: auto; /* Enable vertical scrolling if the content overflows */
  max-height: calc(
    100vh - 150px
  ); /* Set the maximum height between header and sticky footer */
}

.adjustable-loads {
  max-height: 100vh;
}
/*end*/

.border-top {
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.25);
}

.loads-footer :deep() .el-button--primary {
  background-color: #f7941d;
  border-color: #f7941d;
}
.cancel-button {
  background-color: #ffffff;
  border-color: #f7941d;
}

.cancel-button:deep() span {
  color: #f7941d;
}

.button-text {
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 0.25px;
}

:deep() .el-button > span {
  font-family: "Poppins";
}
</style>
