<!-- TabsComponent.vue (Child Component) -->
<template>
  <div>
    <div
      class="tabs-container"
      :style="tabsContainerStyles()"
      style="position: relative"
    >
      <div
        v-for="(tab, index) in tabsData.options"
        :key="index"
        @click="setActiveTab(index)"
        :class="{ active: activeTab === index }"
        :style="getStyles()"
      >
        {{ tab.tab_name }}

        <span>
          <el-popover placement="top-start" trigger="hover" :width="358">
            <template #reference>
              <div :class="iIconStyles(index)">
                <span :class="iLetterStyles(index)">
                  <i> i</i>
                </span>
              </div>
            </template>
            <p>{{ tab.description }}</p>
          </el-popover>
        </span>
      </div>
    </div>
    <div>
      <DynamicDataComponent
        :data="tabsData.options[activeTab].tab_fields"
        :type="type"
        @offGridActive="offGridActive"
        @generateData="generateData"
      />
    </div>
  </div>
</template>

<script setup>
import DynamicDataComponent from "./DynamicDataComponent.vue";
import { solarCalculatorStore } from "../../../../store/solarCalculator";
import { onMounted, ref, watch } from "vue";

const props = defineProps(["tabsData", "type", "screen", "fetching_error"]);
const emits = defineEmits([
  "scrollToTop",
  "generateResults",
  "handleErrorResponse",
]);
const store = solarCalculatorStore();
const calculatorData = store.CALCULATOR_DATA_STATE;
let activeTab = ref(calculatorData.active_tab);

const generateData = () => {
  emits("generateResults");
};

watch(
  () => props.fetching_error,
  (newVal, oldVal) => {
    if (newVal === true) {
      activeTab.value = calculatorData.active_tab;
      emits("handleErrorResponse");
    }
  }
);

const setActiveTab = (index) => {
  activeTab.value = index;
  if (activeTab.value === 0) {
    store.UPDATE_CALCULATOR_DATA("On-Grid", "SelectedGrid");
    store.UPDATE_CALCULATOR_DATA(0, "active_tab");
    emits("generateResults");
  }
  if (activeTab.value === 1) {
    store.UPDATE_CALCULATOR_DATA("Off-Grid", "SelectedGrid");
    store.UPDATE_CALCULATOR_DATA(1, "active_tab");
    emits("generateResults");
  }
};

const offGridActive = () => {
  setActiveTab(1);
};

const iIconStyles = (index) => {
  if (activeTab.value === index) {
    return "i_icon";
  } else {
    return "i_icon_not_active";
  }
};

const iLetterStyles = (index) => {
  if (activeTab.value === index) {
    return "i_content";
  } else {
    return "i_content_not_active";
  }
};

const getStyles = () => {
  if (props.screen === "full") {
    return {
      display: "flex",
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "8px",

      padding: "15px",

      cursor: "pointer",
    };
  } else {
    return {
      display: "flex",
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "8px",

      padding: "15px",
      margin: "5px",
      cursor: "pointer",
    };
  }
};

const tabsContainerStyles = () => {
  if (props.screen === "full") {
    return {
      display: "flex",
      color: "black",
      backgroundColor: "white",
      boxShadow: "0px 0px 6px 0px rgba(0, 0, 0, 0.15)",
      borderRadius: "8px",
    };
  } else {
    return {
      display: "flex",
      color: "#777777",
      backgroundColor: "#E8EDF2",
      fontFamily: "Arial",
      fontSize: "20px",
      fontStyle: "normal",
      fontWeight: "700",
      lineHeight: "normal",
      borderRadius: "8px",
    };
  }
};
</script>

<style scoped>
.active {
  background-color: #006eaf;
  color: white;
}

.i_icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 15px;
  width: 15px;
  background-color: white;
  border-radius: 50%;
  margin-left: 5px;
  cursor: pointer;
}
.i_icon_not_active {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 15px;
  width: 15px;
  background-color: #777;
  border-radius: 50%;
  margin-left: 5px;

  cursor: pointer;
}
.i_content {
  font-size: 12px;
  font-weight: 800;
  font-family: cursive;
  color: #006eaf;
  padding-right: 2px;
}
.i_content_not_active {
  font-size: 12px;
  font-weight: 800;
  font-family: cursive;
  color: white;
  padding-right: 2px;
}

@media screen and (max-width: 1180px) and (min-width: 375px) {
  .tabs-container{
    background-color: white !important;
    
  }
  .active {
  background-color: transparent;
  color: #006EAF;
  border-bottom: 2px solid #006EAF;
  border-radius: 0 !important;

}

.i_icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 15px;
  width: 15px;
  background-color: #777;
  border-radius: 50%;
  margin-left: 5px;
  cursor: pointer;
}
.i_icon_not_active {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 15px;
  width: 15px;
  background-color: #777;
  border-radius: 50%;
  margin-left: 5px;

  cursor: pointer;
}
.i_content {
  font-size: 12px;
  font-weight: 800;
  font-family: cursive;
  color: white;
  padding-right: 2px;
}
.i_content_not_active {
  font-size: 12px;
  font-weight: 800;
  font-family: cursive;
  color: white;
  padding-right: 2px;
}

}

@media screen and (max-width: 740px) and (min-width: 360px) {
  .tabs-container{
    background-color: white !important;
    
  }
  .active {
  background-color: transparent;
  color: #006EAF;
  border-bottom: 2px solid #006EAF;
  border-radius: 0 !important;

}

.i_icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 15px;
  width: 15px;
  background-color: #777;
  border-radius: 50%;
  margin-left: 5px;
  cursor: pointer;
}
.i_icon_not_active {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 15px;
  width: 15px;
  background-color: #777;
  border-radius: 50%;
  margin-left: 5px;

  cursor: pointer;
}
.i_content {
  font-size: 12px;
  font-weight: 800;
  font-family: cursive;
  color: white;
  padding-right: 2px;
}
.i_content_not_active {
  font-size: 12px;
  font-weight: 800;
  font-family: cursive;
  color: white;
  padding-right: 2px;
}
}
</style>
