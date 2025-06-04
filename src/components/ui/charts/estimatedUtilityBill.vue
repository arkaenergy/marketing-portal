<template>
  <canvas id="barChartOne" class="canvasClass"></canvas>
</template>
   
<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables)

export default {
  props: {
    estimatedUtilityBillWithSolarData: {
      type: Array
    },
    estimatedUtilityBillWithoutSolarData: {
      type: Array
    },
  },

  mounted() {
    let labelsList = [];
    for (let i = 1; i < 26; i++) {
      labelsList.push(i);
    }

    const ctx = document.getElementById("barChartOne").getContext('2d');
    let barChartOne = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labelsList,
        datasets: [{
          label: 'Bill With Solar',
          data: this.estimatedUtilityBillWithSolarData,
          backgroundColor: "#0db02b",
          barPercentage: 1,
          categoryPercentage: 0.6,
        }, {
          label: 'Bill Without Solar',
          data: this.estimatedUtilityBillWithoutSolarData,
          backgroundColor: "#cacaca",
          barPercentage: 1,
          categoryPercentage: 0.6,
        }]
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            align: 'start',
            labels: {
              boxWidth: 30,
              boxHeight: 20,
              color : '#000',
              font:{
                size: 14,
                weight: 400,
                family: 'CeraPro'
              }
            },
          },
          title: {
            display: true,
            text: 'Estimated Utility Bill',
            font: {
              size: 22,
              weight: 500,
              family: 'CeraPro',
              lineHeight: '40px',
            },
            color: '#000',
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
              text: 'Years',
              align: 'end',
              font: {
              size: 20,
              weight: 500,
              family: 'CeraPro',
              lineHeight: '40px',
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
            ticks: {
              callback: function(value) {
                let val;
                let unit;
                if(!value){
                  return value.toFixed(2);
                }
                if(value >= 0) {
                  val = value;
                  unit = '₹';
                } else {
                  val = (-1)*value;
                  unit = '-₹';
                }
                val = val.toLocaleString('en-US');
                return unit+val+' ';
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
    this.barChartOne = barChartOne;
  },
}
</script>
   
<style scoped>
@import './chartStyles.css';
</style>
   
   
   