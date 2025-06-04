<template>
  <div>
    <canvas ref="lineChart"></canvas>
  </div>
</template>

<script setup>
import { Chart, registerables } from "chart.js";
import { onMounted, ref, onBeforeUnmount } from "vue";
const lineChart = ref(null);
const chart = ref(null);

onMounted(() => {
  if (chart.value) {
    chart.value.destroy();
  }

  chart.value = new Chart(lineChart.value, {
    type: "line",
    data: {
      labels: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25,
      ],
      datasets: [
        {
          label: "",
          data: [
            10, 5, 15, 12, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85,
            90, 95, 100, 105, 110, 115, 120, 125,
          ],
          backgroundColor: "#006EAF",
          borderColor: "#006EAF",
          borderWidth: 3,
          tension: 0.5,
          pointRadius: 0,
        },
        {
          label: "",
          data: [
            50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180,
            190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290,
          ],
          backgroundColor: "#BFBFBF",
          borderColor: "#BFBFBF",
          borderWidth: 3,
          tension: 0.5,
          pointRadius: 0,
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
