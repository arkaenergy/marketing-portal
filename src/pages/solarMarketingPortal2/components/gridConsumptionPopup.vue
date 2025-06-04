<template>
    <div class="equipmentParentContainer">
        <el-dialog v-model="visiblePopupp" title="Add/Edit Equipments" :close-on-click-modal="false" @close="handleClose">
            <div class="container">
                <img src="../assets/crossIcon.svg" alt="" class="crossIcon" @click="handleClose()" />
                <div class="gridContainer">
                    <div class="inputCont">
                        <p class="label">Average Price per unit</p>
                        <el-input v-model="avgPricePerUnit" placeholder="Please input" @input="isPricePerUnitValueChanged = true"/>
                        <p class="dollarSign ">$</p>
                    </div>
                    <div class="inputCont">
                        <p class="label">Main Panel Rating</p>
                        <el-select v-model="mainPanelRating" placeholder="Select">
                            <el-option v-for="item in panelRatingOptions" :key="item.value" :label="item.label" :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="inputCont">
                        <p class="label">Daily electricity consumption pattern</p>
                        <el-select v-model="selectedConsumptionPattern" placeholder="Select" >
                            <el-option v-for="item in consumptionPatternNameArray" :key="item" :label="item" :value="item">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="graphContainer">
                    <p class="graphLabel">{{selectedConsumptionPattern}}</p>
                    <div class="graphBorder">
                        <LineChart
                        :chartData="chartData"
                        :reRender="chartCounter"
                        style="height: 30vh"
                      />
                    </div>
                    
                    <!-- <img src="../assets/graph.svg" alt="" class="graph" /> -->
                </div>
            </div>
        </el-dialog>
    </div>
</template>
  
<script >
import LineChart from "./lineChart.vue";
export default {
    components: {
        LineChart,
    },
    created(){
        this.initializeDataFromLS()
    },  

    props: {
        isGridConsumptionPopupVisible: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            input: '',
            avgPricePerUnit:0.1,
            isPricePerUnitValueChanged:false,
            chartCounter: 0,
            chartData: {
                // labels: [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0],
                labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,11,12,13,14,15,16,17,18,19,20,21,22,23],
                datasets: [
                    {
                        label: "Consumption Data",
                        backgroundColor: "#f87979",
                        data: [7.0, 7.5, 8.0, 7.0, 6.6, 5.0, 4.0, 2.5, 2.0, 2.2, 2.0, 1.8, 1.8, 2.0, 2.5, 3.0, 3.0, 4.0, 5.0, 8.0, 7.0, 6.5, 6.0, 6.5],
                    },
                ],
            },
            panelRatingOptions: [
                {
                    value: 60,
                    label: '60 A'
                }, 
                {
                    value: 100,
                    label: '100 A'
                },
                {
                    value: 125,
                    label: '125 A'
                },
                {
                    value: 175,
                    label: '175 A'
                },
                {
                    value: 200,
                    label: '200 A'
                },
                {
                    value: 325,
                    label: '325 A'
                },
                {
                    value: 400,
                    label: '400 A'
                },
            ],
            mainPanelRating:200,
            selectedConsumptionPattern:"Nighttime focused consumption",
            consumptionPatternArray: [
                {
                    Name: "Commercial (shopping hours)",
                    Consumption: [1.0, 1.0, 1.0, 1.0, 1.5, 1.8, 2.0, 2.5, 3.0, 4.0, 4.5, 5.0, 5.0, 4.5, 4.0, 4.0, 5.0, 5.0, 4.5, 4.0, 3.0, 2.0, 1.0, 1.0]
                },
                {
                    Name: "Weekdays focused consumption",
                    Consumption: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 3.5, 4.0, 4.5, 5.0, 5.0, 4.5, 4.0, 4.5, 5.0, 5.0, 4.0, 2.0, 1.5, 1.0, 1.0, 1.0]
                },
                {
                    Name: "Evening focused consumption",
                    Consumption: [1.0, 0.5, 0.5, 0.5, 1.0, 1.5, 1.8, 2.0, 2.0, 2.5, 3.0, 3.2, 4.2, 4.0, 3.0, 3.0, 3.5, 4.0, 5.0, 6.0, 5.0, 3.0, 2.0, 1.0]
                },
                {
                    Name: "Constant energy consumption",
                    Consumption: [3.0, 3.0, 3.0, 3.0, 4.0, 5.0, 5.5, 6.0, 6.5, 6.5, 6.0, 5.5, 6.0, 6.8, 7.0, 6.5, 6.0, 5.5, 5.0, 4.5, 4.2, 4.0, 3.7, 3.3]
                },
                {
                    Name: "Nighttime focused consumption",
                    Consumption: [7.0, 7.5, 8.0, 7.0, 6.6, 5.0, 4.0, 2.5, 2.0, 2.2, 2.0, 1.8, 1.8, 2.0, 2.5, 3.0, 3.0, 4.0, 5.0, 8.0, 7.0, 6.5, 6.0, 6.5]
                },
                {
                    Name: "Retirees or working from home",
                    Consumption: [2.0, 2.0, 2.0, 2.0, 3.0, 5.0, 6.5, 6.0, 5.5, 5.5, 6.0, 6.5, 6.0, 5.5, 5.0, 5.0, 5.5, 7.0, 8.0, 7.0, 6.0, 3.0, 2.0, 2.0]
                },
                {
                    Name: "Single or two person household",
                    Consumption: [2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.5, 4.0, 3.0, 2.5, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 3.0, 5.0, 6.2, 7.0, 6.8, 6.0, 2.0, 2.0]
                },
                {
                    Name: "Family with infants or pre-school children",
                    Consumption: [2.0, 2.0, 2.0, 2.0, 2.0, 3.0, 5.0, 5.5, 6.0, 6.0, 4.0, 3.0, 3.5, 5.0, 3.5, 4.0, 4.5, 6.0, 7.0, 5.5, 3.0, 2.0, 2.0, 2.0]
                },
                {
                    Name: "Family with school-age children",
                    Consumption: [2.0, 2.0, 2.0, 2.0, 2.0, 3.0, 4.0, 5.0, 5.5, 4.0, 2.5, 2.2, 2.0, 2.5, 2.8, 3.2, 4.0, 6.0, 7.0, 6.0, 5.0, 4.0, 2.0, 2.0]
                },
            ]
        };
    },

    computed: {
        visiblePopupp() {
            return this.$props.isGridConsumptionPopupVisible;
        },
        consumptionPatternNameArray(){
            return this.consumptionPatternArray.map(item=> item.Name);
        },
        selectedConsumptionPatternValues(){
            let selectedPatternObj =  this.consumptionPatternArray.find(item=>{
                return item.Name== this.selectedConsumptionPattern
            });
            return selectedPatternObj.Consumption
        }
    },

    watch:{
        selectedConsumptionPatternValues(value){
            this.chartData.datasets[0].data = value;
            this.chartCounter++;
        }
    },

    methods: {
        handleClose() {
            let returnedDataObj =  {
                "avgPricePerUnit": this.avgPricePerUnit,
                "mainPanelRating":this.mainPanelRating,
                "selectedConsumptionPattern":this.selectedConsumptionPattern,
                "isPricePerUnitValueChanged": this.isPricePerUnitValueChanged,
            }
            this.$emit("emitData",returnedDataObj)
            this.$emit("close");
        },
        initializeDataFromLS(){
            let dataFromLS = JSON.parse(localStorage.getItem('jsonToSendForCalculation'));
            this.avgPricePerUnit = dataFromLS['avgPricePerUnit']
            this.mainPanelRating = dataFromLS['mainPanelRating']
            this.selectedConsumptionPattern = dataFromLS['selectedConsumptionPattern']
        }
    },
};
</script>
  
<style scoped>
p,
span,
div,
h1,
h2,
h3,
h4,
button,
a,
input {
    font-family: 'Poppins';
}

.errorText {
    font-size: 14px;
    color: red;
    margin-top: 4px;
}

.equipmentParentContainer :deep() .el-dialog {
    width: 90vw;
    max-width: 650px;
    border-radius: 8px !important;
    margin-top: 10vh !important;
}

.equipmentParentContainer :deep() .el-dialog__header {
    display: none !important;
}

.equipmentParentContainer :deep() .el-dialog__body {
    padding: 0px !important;
}

.container {
    padding: 16px;
    padding-bottom: 24px;
}

.crossIcon {
    float: right;
    cursor: pointer;
}

.gridContainer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 16px 8px 0px 8px;
}

.label {
    color: #0D0D0D;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
}

.graphLabel {
    color: #000;
    font-size: 14px;
    margin-bottom: 16px;
}

.graphBorder {
    width: 100%;
    border: 1px solid #bfbfbf;
    border-radius: 8px;
    padding: 8px 0px;
}

.inputCont {
    position: relative;
}

.dollarSign {
    position: absolute;
    top: 38px;
    right: 12px;
    color: #0D0D0D;
    font-size: 16px;
}

.container :deep() .el-select {
    width: 100%;
}

.container :deep() .el-select .el-input__inner,
.container :deep() .el-input__inner {
    font-size: 16px;
    color: #0D0D0D;
    height: 40px;
    font-family: 'Poppins';
}

.graphContainer {
    padding: 24px 8px 0px 8px;
}

.graph {
    width: 100%;
}

/* .equipmentParentContainer :deep() .el-scrollbar__wrap {
    overflow: auto;
    height: 100%;
    padding: 24px 16px 24px 24px;
    word-break: break-word;
    max-height: 535px;
    overflow: hidden;
    overflow-y: scroll;
} */

@media (max-width: 700px) {
    .equipmentParentContainer :deep() .el-dialog {
        width: 90vw;
        margin-top: 8vh;
    }

    .gridContainer {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 8px 0px 0px 0px;
    }

    .graphContainer {
    padding: 16px 0px 0px 0px;
}
}
</style>