<template>
  <div class="pricingContainer" v-if="data">
    <h5 class="pricingHeader">{{ data.label }}</h5>

    <p class="pricingValue">{{ data.description }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  data: Object,
});
</script>

<style lang="scss" scoped>
.pricingContainer {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
  background-color: #edf2f6;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 8px;
  height: 25vh;
  margin-top: 23px;
}

.pricingHeader {
  color: var(--777, #777);
  font-family: Arial;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.pricingInfo {
  color: var(--777, #777);
  font-family: Arial;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.pricingValue {
  color: var(--grey-grey-5, #0d0d0d);
  font-family: Arial;
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
</style>
