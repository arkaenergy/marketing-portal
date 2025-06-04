<template>
  <div style="flex: 1" class="emiContainer" v-if="items.sub_options.length > 0">
    <div
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <p>{{ items.label }}</p>
      <p>{{ items.description }}</p>
    </div>

    <div class="emi_calculator">
      <div v-for="data in items.sub_options" class="inner_card">
        {{ data.label }}
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <p class="label">Loan Amount</p>
          <p class="label">{{ data.loan_amount }}</p>
        </div>
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
          class="input_container"
        >
          <p class="label" style="width: 13%">Term</p>
          <div style="display: flex" class="inner_container">
            <input type="text" class="input" />
            <p style="color: rgb(163, 163, 163)">Years</p>
          </div>
        </div>

        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <p class="label">Interest Rate</p>
          <p class="label">{{ data.interest_rate }}</p>
        </div>

        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <span class="demonstration">7</span>
          <el-slider v-model="data.interest_rate"></el-slider>
          <span>14</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: Object,
});
</script>

<style lang="scss" scoped></style>
