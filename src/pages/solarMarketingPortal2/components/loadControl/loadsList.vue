<template>
  <div class="loads-list">
    <div class="appliance-list">
      <el-row class="header-row">
        <el-col :span="2" class="center-align">Own</el-col>
        <el-col :span="6" class="left-align">Appliance Name</el-col>
        <el-col :span="4" class="center-align" style="display: flex"
          >Optimal Usage
          <el-tooltip placement="top" popper-class="custom-tooltip">
            <!--  :content="'Used only during the day, and not simultaneously with other appliances.'" -->
            <img style="padding-left: 5px" src="../../assets/InfoOptimal.svg" />
            <template v-slot:content>
              <div class="custom-tooltip-text">
                Used only during the day, and not simultaneously with other
                appliances.
              </div>
            </template>
          </el-tooltip>
        </el-col>
        <el-col :span="4" class="center-align">Backup</el-col>
        <el-col :span="4" class="center-align">Quantity</el-col>
        <el-col :span="4" class="center-align">Action</el-col>
      </el-row>
      <el-row
        v-for="(appliance, index) in appliances"
        :key="appliance.id"
        class="data-row"
      >
        <el-col
          :span="2"
          class="center-align"
          style="display: flex; justify-content: center; align-items: center;padding-top:7px;"
        >
          <img
            src="../../assets/Check.svg"
            v-show="!appliance.own"
            @click="toggleOwn(appliance, index)"
          />
          <img
            src="../../assets/Checked.svg"
            v-show="appliance.own"
            @click="toggleOwn(appliance, index)"
          />
        </el-col>
        <el-col :span="6" class="left-align padding-top-4" >{{ appliance.name }}</el-col>
        <el-col :span="4" class="center-align">
          <el-switch
            v-model="appliance.optimalUsage"
            :disabled="appliance.own === false"
            @change="emitAppliance(appliance, index)"
          ></el-switch>
        </el-col>
        <el-col :span="4" class="center-align">
          <el-switch
            v-model="appliance.backup"
            :disabled="appliance.own === false"
            @change="emitAppliance(appliance, index)"
          ></el-switch>
        </el-col>
        <el-col :span="4" class="center-align" style="padding-top:5px" >{{ appliance.quantity }}</el-col>
        <el-col :span="4" class="center-align padding-top-4" >
          <img
            src="../../assets/Pencil.svg"
            @click="editAppliance(appliance, index)"
          />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import CreateAppliance from "./createAppliance.vue";
import GlobalDialog from "../globalDialog.vue";
export default {
  components: {
    CreateAppliance,
    GlobalDialog,
  },
  data() {
    return {
      appliances: this.$props.appliancesList,
    };
  },
  props: {
    appliancesList: {
      type: Array,
      required: true,
    },
  },
  methods: {
    emitAppliance(appliance, index) {
      // console.log("in list");
      // console.log(index);
      this.$emit("updateAppliance", appliance, index);
    },
    toggleOwn(appliance, index) {
      appliance.own = !appliance.own;
      //If ownership is false, make the backup and optimalUsage also false
      if(appliance.own === false){
        appliance.backup = false;
        appliance.optimalUsage = false;
      }
      this.$emit("updateAppliance", appliance, index);
    },
    editAppliance(appliance, index) {
      console.log("edit");
      //emit data to parent
      this.$emit("openEditAppliance", appliance, index);
    },
  },
};
</script>

<style scoped>
* {
  font-family: "Poppins";
}
.loads-list {
  width: 100%;
}
.appliance-list {
  overflow: hidden;
}
.header-row {
  color: var(--black, #222);
  font-family: Poppins;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.data-row {
  color: var(--black, #222);
  font-family: Poppins;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.header-row,
.data-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
}

/* Left-align Appliance Name */
.left-align {
  text-align: left;
}

/* Center-align all other columns */
.center-align {
  text-align: center;
}

.el-switch {
  margin: 0 auto;
  text-align: center;
}

.loads-list :deep() .el-switch.is-checked .el-switch__core {
  border-color: #f7941d;
  background-color: #f7941d;
}

.loads-list img {
  cursor: pointer;
}

.padding-top-4{
  padding-top: 4px;
}

/* Image tooltip styling*/
.loads-list :deep() .custom-tooltip .el-tooltip {
  border-radius: 4px;
  background: #404040;
  display: flex;
  width: 8.75rem;
  padding: 4px 0.5rem;
  justify-content: center;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
}

.custom-tooltip-text {
  color: #fff;
  font-family: Poppins;
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}
</style>
