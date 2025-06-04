<template>
  <canvas id="barChartFour"></canvas>
</template>
   
<script>
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables)

export default {
  props: {
    productionData: {
      type: Array
    },
  },

  mounted() {
    let labelsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const ctx = document.getElementById("barChartFour").getContext('2d');
    let barChartFour = new Chart(ctx, {
      type: 'bar',
      plugins: [ChartDataLabels],
      data: {
        labels: labelsList,
        datasets: [{
          label: 'data-1',
          data: this.productionData,
          backgroundColor: "#0db02b",
          barPercentage: 0.5,
          categoryPercentage: 0.8,
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            color: 'white',
            anchor: 'end',
            align: 'start',
            formatter: value => {
              return Math.round(value)
            },
            rotation: -90,
          }
        },
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              color: '#989899',
            },
            title: {
              display: true,
              text: 'Months',
              align: 'center',
              font: {
              size: 18,
              weight: 400,
              family: 'CeraPro',
              lineHeight: '40px'
            },
            color: '#000',
            }, 
            ticks: {
              color: '#000',
              font: {
              size: 14,
              weight: 500,
              family: 'CeraPro',
            },
            color: '#000',
            }
          },
          y: {
            grid: {
              drawOnChartArea: false,
              tickColor: '#989899',
              tickLength: 10,
            },
            border: {
              color: '#989899',
            },
            title: {
              display: true,
              text: 'kWh',
              align: 'center',
              font: {
              size: 18,
              weight: 400,
              family: 'CeraPro',
              lineHeight: '40px'
            },
            color: '#000',
            },
            ticks: {
              callback: function(value) {
                // let val = value.toFixed(2);
                return value+' ';
              },
              font: {
              size: 14,
              weight: 500,
              family: 'CeraPro',
            },
            color: '#000',
            } 
          }
        },
        layout: {
          padding: 20
        }
      }
    });
    this.barChartFour = barChartFour;
  },
}
</script>