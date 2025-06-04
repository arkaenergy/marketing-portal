<template>
  <canvas id="barChartTwo" class="canvasClass"></canvas>
</template>
   
<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables)

export default {
  props: {
    breakEvenAnalysisData: {
      type: Array
    },
  },

  mounted() {
    let labelsList = [];
    for (let i = 1; i < 26; i++) {
      labelsList.push(i);
    }

    const ctx = document.getElementById("barChartTwo").getContext('2d');
    let barChartTwo = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labelsList,
        datasets: [{
          label: 'data-1',
          data: this.breakEvenAnalysisData,
          backgroundColor: (context) => {
            let data = context.dataset.data;
            let colorArr = data.map(val => {
              if (val < 0) {
                return '#cacaca';
              } else {
                return '#0db02b';
              }
            });
            return colorArr
          },
          barPercentage: 1,
          categoryPercentage: 0.6,
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Break-Even Analysis',
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
              z: 10
            },
            title: {
              display: true,
              text: 'Years',
              align: 'center',
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
    this.barChartTwo = barChartTwo;
  },
}
</script>
   
<style scoped>
@import './chartStyles.css';
</style>