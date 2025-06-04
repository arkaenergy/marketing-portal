<template>
  <div v-if="data">
    <div>
      <Info
        :tabsData="data"
        @tabChanges="tabChanges"
        @calculateData="calculateData"
      />
    </div>

    <div>
      <div v-if="type === 'card'">
        <AllFields :data="data" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Info from "../../InformationTab/Info.vue";
import AllFields from "../../../allFields.vue";

const props = defineProps(["data", "type"]);
const emit = defineEmits(["offGridActive", "generateData"]);

const calculateData = () => {
  emit("generateData");
};

const tabChanges = () => {
  emit("offGridActive");
};
</script>
