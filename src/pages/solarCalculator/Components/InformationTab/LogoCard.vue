<template>
  <div>
    <div class="header">
      <p style="margin-bottom: 10px">Our Financing Partners</p>
    </div>
    <div class="logo-container">
      <div class="logos-wrapper">
        <img
          v-for="(logo, index) in logos"
          :key="index"
          :src="logo"
          :alt="'logo-' + index"
          class="logo"
        />
      </div>
      <div class="logos-wrapper">
        <img
          v-for="(logo, index) in logos"
          :key="index"
          :src="logo"
          :alt="'logo-' + index"
          class="logo"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ecofy from "../../assets/logoimage/logo-ecofy-sticky-fotor-20241202193515.jpg"
import axis from "../../assets/logoimage/axis-fotor-20241202201859.jpg";
import greenlance from "../../assets/logoimage/greenlance-fotor-20241202193346.png"
import hdfc from "../../assets/logoimage/HDFC-fotor-20241202201651.jpg";
import icici from "../../assets/logoimage/icici-fotor-2024120219384.jpg";
import creditFiar from "../../assets/logoimage/Redit-fotor-2024120219390.jpg"
import sbi from "../../assets/logoimage/SBI-fotor-20241202193941.jpg"
import bankofbaroda from "../../assets/logoimage/BankOfBarodaLogo.svg-fotor-2024120219408.png"
import unionBank from "../../assets/logoimage/Union-Bank-of-India-new-fotor-20241202194115.png"
import sibidi from "../../assets/logoimage/sidbi-fotor-2024120219424.jpg"
import yesbank from "../../assets/logoimage/yes bank-fotor-20241202194234.jpg"
import tatacaptial from "../../assets/logoimage/Tata_Capital_Logo-01-fotor-2024120219437.jpg"

const logos = ref([
  ecofy,
  axis,
  greenlance,
  hdfc,
  icici,
  creditFiar,
  sbi,
  bankofbaroda,
  unionBank,
  sibidi,
  yesbank,
  tatacaptial,
]);
</script>

<style scoped>
.header {
  color: var(--777, #777);
  font-family: Arial;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  border-bottom: 2px solid var(--CCC, #ccc);
  margin-top: 10px;
  margin-bottom: 10px;
}

.logo-container {
  width: 100%;
  overflow: hidden;
  display: inline-block;
  white-space: nowrap;
  padding: 23px 0px;
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
    inset;
  border-radius: 8px;
}

.logos-wrapper {
  display: inline-block;
  animation: 25s slide linear infinite; /* Adjust the duration as needed */
  padding: 10px 12px;
}

.logos-wrapper >>> img {
  height: 50px;
  width: auto;
}

.logo {
  margin-right: 20px; /* Adjust the margin between logos as needed */
}

@keyframes slide {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
</style>
