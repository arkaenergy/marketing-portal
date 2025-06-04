<template>
  <div>
    <TabsComponent :tabsData="data" :type="'card'" :screen="'full'" />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import TabsComponent from "./TabsComponent.vue";
const props = defineProps({
  data: Object,
});
</script>

<style scoped></style>
