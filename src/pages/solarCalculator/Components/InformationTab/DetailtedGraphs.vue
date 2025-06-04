<template>
  <div class="mainCardContainer">
    <div class="header">
      <div class="information">
        <p class="chartInfo">{{ data?.label }}</p>
      </div>
      <div class="colorInfo">
        <div class="colorInformation">
          <div class="blueColor"></div>
          <p style="margin-right: 10px">
            {{ data?.additional_info.first_label }}
          </p>
          <div class="greyColor"></div>
          <p>{{ data?.additional_info.second_label }}</p>
        </div>
      </div>
    </div>
    <div class="footer">
      <slot name="graph"></slot>
      <p class="xinfo">Years</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: Object,
});
</script>

<style lang="scss" scoped>
.mainCardContainer {
  border-radius: 16px;
  background: var(--White, #fff);
  padding: 18px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.15);
  margin-top: 10px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cardInfo {
  display: flex;
  align-items: center;
}

.xinfo {
  color: var(--grey-grey-5, #0d0d0d);
  font-family: Arial;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 5px;
}
.colorInformation {
  display: flex;
  align-items: center;
  width: 100%;
}
.blueColor {
  width: 20px;
  height: 20px;
  background: var(--Primary-Tata, #006eaf);
  margin-right: 10px;
}
.greyColor {
  width: 20px;
  height: 20px;
  background: var(--grey-grey-75, #bfbfbf);
  margin-right: 10px;
}
.chartInfo {
  color: var(--grey-grey-5, #0d0d0d);
  font-family: Arial;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
</style>
