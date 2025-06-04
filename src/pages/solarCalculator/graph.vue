<template>
  <div>
    <canvas ref="myChart"></canvas>
  </div>
</template>

<script setup>
import { Chart, registerables } from "chart.js";
import { onMounted, ref } from "vue";
import { solarCalculatorStore } from "../store/solarCalculator";

const props = defineProps({
  barType: {
    type: String,
    default: "bar",
  },
});

const store = solarCalculatorStore();

const calculatorData = ref(store.calculatorData);

const bill_with_solar = ref(calculatorData.value.bill_with_solar);
const bill_without_solar = ref(calculatorData.value.bill_without_solar);
const chart = ref(null);
const myChart = ref(null);

onMounted(() => {
  if (chart.value) {
    chart.value.destroy();
  }

  chart.value = new Chart(myChart.value, {
    type: props.barType,
    data: {
      labels: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25,
      ],
      datasets: [
        {
          label: "",
          data: bill_with_solar.value,

          backgroundColor: "#006EAF",
          borderWidth: 1,
        },
        {
          label: "",
          data: bill_without_solar.value,

          backgroundColor: "#BFBFBF",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          grid: {
            drawOnChartArea: false,
            drawTicks: false,
          },
          ticks: {
            stepSize: 5,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 5,
          },
          grid: {
            drawOnChartArea: false,
            drawTicks: false,
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            boxWidth: 0,
          },
        },
      },
    },
  });
});
</script>

<style lang="scss" scoped></style>
