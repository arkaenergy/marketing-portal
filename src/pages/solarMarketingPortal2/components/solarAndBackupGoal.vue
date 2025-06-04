<template>
    <div class="container">
        <Header
            :pageNo="2"
            :heading="heading"
            @reset="$emit('reset')"
        />
        <div class="gridCont" v-loading="isLoading">
            <div class="flexCont">
                <div class="flexRowCont">
                    <div class="editIconCont">
                        <p class="demonstration">What is your net monthly grid consumption?</p>
                        <img src="../assets/PencilSquare.svg" alt="" class="editIcon" @click="isGridConsumptionPopupVisible = true"/>
                    </div>
                    <div class="positionR">
                        <input class="billInp disableInput" v-model="avgMontlyEngConsump" disabled />
                        <p class="dollarSign ">kWh</p>
                        <p class="errorMsg" v-if="Number(avgMontlyEngConsump)<=0" >This field is required!</p>
                    </div>
                    
                </div>
                <div class="flexRowCont">
                    <p class="demonstration ">What is the area of your home, including all floors?</p>
                    <div class="positionR">
                        <el-select v-model="homeAreaSq" placeholder="Select" @change="saveDataInLocalStorage('jsonToSendForCalculation','homeAreaSq',homeAreaSq)">
                            <el-option v-for="item in homeAreaSqOptions" :key="item.value" :label="item.label" :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="flexColumnCont">
                    <span class="demonstration">I’m looking for?</span>
                    <el-radio-group v-model="userLookingFor" class="gapCheckBox" @change="saveDataInLocalStorage('jsonToSendForCalculation','userLookingFor',userLookingFor)">
                        <el-radio label="Solar with Battery">Solar with Battery<br /><span class="spanClass">(Maximize Bill
                                Savings)</span></el-radio>
                        <el-radio label="Batteries Only">Batteries Only</el-radio>
                    </el-radio-group>
                </div>
                <div class="flexRowCont">
                    <p class="demonstration">How many hours of backup do you need?</p>
                    <div class="positionR">
                        <input  class="billInp" type="number" min="0" v-model="hoursOfBackup" 
                         @input="saveDataInLocalStorage('jsonToSendForCalculation','hoursOfBackup',hoursOfBackup)" />
                        <p class="dollarSign ">hrs</p>
                        <p class="errorMsg" v-if="hoursOfBackup<=0" >This field is required!</p>
                    </div>
                </div>
                <div class="flexColumnCont">
                    <p class="demonstration">Which of these appliances do you own?</p>
                    <div class="boxContainer">
                        <div class="boxHeader">
                            <p class="head">Appliances</p>
                            <p class="head">Backup</p>
                        </div>
                        <div class="boxBody">
                            <div class="bodyBox" v-for="(appliance,index) in appliancesArrayToBeUsedForCurrentPage" :key="index">
                                <el-checkbox label="true" v-model="appliance.isChecked" @change="changeConfiguration(appliance,index)">{{ appliance.name }}</el-checkbox>
                                <el-switch v-model="appliance.isCritical" active-color="#F7921E" inactive-color="#E8EDF2" @change="changeConfiguration(appliance)">
                                </el-switch>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="invtBattCont">
                <InverterAndBatteryCard
                    title="Inverter"
                    name="Sol-Ark 15K (15K-2P-N)"
                    url="https://drive.google.com/file/d/1yzsn6hv_6wAjWw5-tMrjpfeMk37J8ieV/view"
                />
                <InverterAndBatteryCard
                    title="Featured Battery"
                    name="20kWh Endur Energy Esp-BU20" 
                    url="https://s3.ap-south-1.amazonaws.com/componentpdf/DataSheet_ESP-IBU20.pdf"
                />
            </div>
        </div>
        <Footer
            :pageNo="2"
            :contentsFromPage2ForValidation="contentsFromPage2ForValidation"
            @pageNumberAfterNext="pageNumberAfterNext"
            @pageNumberAfterBack="pageNumberAfterBack"
            @showLeadDetailsPopup="showLeadDetailsPopup"
        />
        <GridConsumptionPopup v-if="isGridConsumptionPopupVisible"
            :isGridConsumptionPopupVisible="isGridConsumptionPopupVisible"
            @emitData="emitData"
            @close="isGridConsumptionPopupVisible = false"
            @systemConfig="systemConfig" />

        <basicInformationPopup
            v-if="isBasicInformationPopupVisible"
            :pageNo="2"
            :isBasicInformationPopupVisible="isBasicInformationPopupVisible"
            @close="isBasicInformationPopupVisible = false"
            @pageNumberAfterNext="pageNumberAfterNext"
        />
    </div>
</template>

<script>
import Footer from "./footer.vue"
import Header from "./header.vue"
import InverterAndBatteryCard from "./inverterAndBatteryCard.vue"
import GridConsumptionPopup from './gridConsumptionPopup.vue'
import {saveDataInLocalStorage } from '@/utils.js'
import basicInformationPopup from './basicInformationPopup.vue';
import API from '@/services/api';

export default {
    components: {
        Footer,
        Header,
        InverterAndBatteryCard,
        GridConsumptionPopup,
        basicInformationPopup
    },
    async created() {
        let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
        if(!data['originalAvgPricePerUnit']){
            delete data['avgPricePerUnit'];
        }
        delete data['originalAvgPricePerUnit'];
        await this.fetchCalculationFromBackend(data);
        this.initializeDataFromLS()
        this.modifyLSbasedOnAPIResponse();
        this.JSONTofetchAppliancesFromID = JSON.parse(localStorage.getItem('id-mapping-appliances'))
        this.appliancesArrayToBeUsedForCurrentPage = this.usedAppliancesIDsForCurrentPage.map(id=>{
            return  this.JSONTofetchAppliancesFromID[id]
        })
        this.criticalListOfJson = JSON.parse(JSON.stringify(data['final_critical_list'])); 
        this.totalLoadAppliances = JSON.parse(JSON.stringify(data['final_total_appliances']));
        this.linkCriticalIDToBoolean();
        this.linkTotalLoadAppliancesToBoolean();
        this.addCheckedAndCriticalKeys(); 
    },
    mounted(){
        // this.initializeDataFromLS()
    },
    data() {
        return {
            userLookingFor: 'Solar with Battery',
            homeAreaSqOptions: [{
                value: 1500,
                label: 'area < 1500 sq.ft.'
            },
            {
                value: 3000,
                label: '1500 sq.ft. - 3000 sq.ft.'
            },
            {
                value: 4500,
                label: '3000 sq.ft. - 4500 sq.ft.'
            },
            {
                value: 6000,
                label: '4500 sq.ft. - 6000 sq.ft.'
            },
            {
                value: 'area > 6000 sq.ft.',
                label: 'area > 6000 sq.ft.'
            },],
            homeAreaSq: 3000,
            value: null,
            value2: null,
            heading:"Tell me about your solar & backup goal",
            isGridConsumptionPopupVisible: false,
            isValidationError:false,
            avgMontlyEngConsump:null,
            hoursOfBackup: 16,
            // -----------------consumption popup info---------------------------//
            avgPricePerUnit:null,
            mainPanelRating:200,
            selectedConsumptionPattern:"Nighttime focused consumption",
            //---------------------------end---------------------------------------//
            JSONTofetchAppliancesFromID:{},
            usedAppliancesIDsForCurrentPage:[45,21,35], // EV-45, AC HVAC-21, Pool Pump - 35
            appliancesArrayToBeUsedForCurrentPage:[],
            criticalListOfJson:[],
            totalLoadAppliances:[],
            isThisCriticalID:{},
            isThisLoadApplianceID:{},
            isBasicInformationPopupVisible: false,
            isLoading: false,
        }
    },
    methods: {
        initializeDataFromLS(){
            let dataFromLS = JSON.parse(localStorage.getItem('jsonToSendForCalculation'));
            this.homeAreaSq =  dataFromLS['homeAreaSq'];
            this.userLookingFor = dataFromLS['userLookingFor'];
            this.hoursOfBackup = dataFromLS['hoursOfBackup'];
            this.mainPanelRating = dataFromLS['mainPanelRating'] || 200; //when not having this key in backend
            this.selectedConsumptionPattern =  dataFromLS["selectedConsumptionPattern"];
        },
        async fetchCalculationFromBackend(payload){
            this.isLoading=true;
            let dataFromLS = JSON.parse(localStorage.getItem('jsonToSendForCalculation'));
            let response =  await API.SOLARK.FETCH_CALCULATION(payload);
            // localStorage.setItem('final-output',JSON.stringify(response.data));
            // this.finalOutput = response.data;
            this.avgPricePerUnit = response.data.price_perunit;
            console.log("response from backend is",response.data);
            this.isLoading=false;
        },
        pageNumberAfterNext(pageNo){
            this.$emit("pageNumberAfterNext",pageNo);
        },
        pageNumberAfterBack(pageNo){
            this.$emit("pageNumberAfterBack",pageNo);
        },
        emitData(dataObj){
            let dataFromLS = JSON.parse(localStorage.getItem('jsonToSendForCalculation'));
            if(!dataFromLS['originalAvgPricePerUnit'] && dataObj.isPricePerUnitValueChanged){ // only when pricePerUnit is changed, then only create a new key "originalAvgPricePerUnit" otwerwise everytime it should be anyway original
                dataFromLS['originalAvgPricePerUnit'] = Number(dataObj.avgPricePerUnit);
                localStorage.setItem("jsonToSendForCalculation",JSON.stringify(dataFromLS))
            }
            this.avgPricePerUnit = Number(dataObj.avgPricePerUnit);
            this.mainPanelRating = dataObj.mainPanelRating;
            this.selectedConsumptionPattern = dataObj.selectedConsumptionPattern;
            this.modifyLSbasedOnAPIResponse();
        },
        modifyLSbasedOnAPIResponse(){
            let dataFromLS = JSON.parse(localStorage.getItem('jsonToSendForCalculation'));
            dataFromLS["avgPricePerUnit"] = Number(this.avgPricePerUnit);
            dataFromLS["mainPanelRating"]=this.mainPanelRating;
            dataFromLS["selectedConsumptionPattern"]=this.selectedConsumptionPattern;
            localStorage.setItem("jsonToSendForCalculation",JSON.stringify(dataFromLS))
        },
        saveDataInLocalStorage,
        linkCriticalIDToBoolean(){
            for(let i=0;i<this.criticalListOfJson.length;i++){
                this.isThisCriticalID[this.criticalListOfJson[i].id] = true
            }
            console.log("linkCriticalIDToBoolean",this.isThisCriticalID);
        },
        linkTotalLoadAppliancesToBoolean(){
            for(let i=0;i<this.totalLoadAppliances.length;i++){
                this.isThisLoadApplianceID[this.totalLoadAppliances[i].id] = true
            }
            console.log("linkTotalLoadAppliancesToBoolean",this.isThisLoadApplianceID);
        },
        addCheckedAndCriticalKeys(){
            for(let i=0;i<this.appliancesArrayToBeUsedForCurrentPage.length;i++){
                let id = this.appliancesArrayToBeUsedForCurrentPage[i]['id'];
                this.appliancesArrayToBeUsedForCurrentPage[i]['isCritical'] = this.isThisCriticalID[id]? true : false;
                this.appliancesArrayToBeUsedForCurrentPage[i]['isChecked'] = this.isThisLoadApplianceID[id]? true : false;
            }
            console.log("check final array after adding keys",this.appliancesArrayToBeUsedForCurrentPage);
        },
        changeConfiguration(appliance,index){
            console.log("after changing",this.appliancesArrayToBeUsedForCurrentPage,appliance);
            let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
            this.criticalListOfJson = JSON.parse(JSON.stringify(data['final_critical_list'])); 
            this.totalLoadAppliances = JSON.parse(JSON.stringify(data['final_total_appliances']));
            let applianceId = appliance.id;
            let indexInCriticalList= this.criticalListOfJson.findIndex(item=>{
                return item.id == applianceId
            })
            let indexInTotalList = this.totalLoadAppliances.findIndex(item=>{
                return item.id == applianceId
            })
            if(appliance.isChecked && appliance.isCritical){
                if(indexInCriticalList<0){
                    this.criticalListOfJson.push(this.JSONTofetchAppliancesFromID[applianceId])
                }
                if(indexInTotalList<0){
                    this.totalLoadAppliances.push(this.JSONTofetchAppliancesFromID[applianceId])
                }
            }
            else if(appliance.isChecked && !appliance.isCritical){
                if(indexInCriticalList>=0){
                    this.criticalListOfJson.splice(indexInCriticalList,1);
                }
                if(indexInTotalList<0){
                    this.totalLoadAppliances.push(this.JSONTofetchAppliancesFromID[applianceId])
                }
            }
            else if(!appliance.isChecked){
                if(indexInCriticalList>=0){
                    this.criticalListOfJson.splice(indexInCriticalList,1);
                }
                if(indexInTotalList>=0){
                    this.totalLoadAppliances.splice(indexInTotalList,1);
                }
            }
            data['final_critical_list'] = [... this.criticalListOfJson];
            data['final_total_appliances'] = [... this.totalLoadAppliances];
            localStorage.setItem("jsonToSendForCalculation",JSON.stringify(data))
        },
        showLeadDetailsPopup(){
            this.isBasicInformationPopupVisible = true;
            console.log('isBasicInformationPopupVisible: ', this.isBasicInformationPopupVisible);
        }

    },
    computed: {
        contentsFromPage2ForValidation(){
            return {
                "avgMontlyEngConsump": this.avgMontlyEngConsump,
                "hoursOfBackup": this.hoursOfBackup,
            }
        }
    },
    watch: {
        avgPricePerUnit(val){
            let avgMonthlyBill = JSON.parse(localStorage.getItem("jsonToSendForCalculation")).avgMonthlyBill;
            this.avgMontlyEngConsump = (avgMonthlyBill/val).toFixed(2);
        }
    }
}
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

.positionR {
    position: relative;
}

.container {
    width: 100%;
    min-height: calc(100vh - 96px);
    padding: 24px 32px;
    padding-bottom: 120px;
}

.gridCont {
    display: grid;
    grid-template-columns: auto 370px;
    gap: 60px;
    align-items: center;
    margin-top: 24px;
}

.flexCont {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 1000px;
}

.flexRowCont {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    align-items: center;
}

.demonstration,
.container :deep() .el-radio__label,
.head {
    font-size: 20px;
    color: #0D0D0D;
    font-family: 'Poppins';
}

.dollarSign {
    position: absolute;
    top: 8px;
    right: 12px;
    color: #0D0D0D;
    font-size: 16px;
}
.errorMsg{
    color: red;
    font-size: 14px;
}
.billInp {
    width: 100%;
    max-width: 140px;
    font-size: 16px;
    height: 42px;
    padding: 0px 50px 0px 16px;
    background-color: #fff;
    border-radius: 8px;
    border: 1px solid #BFBFBF;
}

.disableInput{
    cursor: not-allowed;
}
.invtBattCont{
    display: grid;
    flex-direction: column;
    gap: 20px;
}
.flexColumnCont {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 8px;
}

.spanClass {
    font-size: 16px;
    color: #808080;
}

.container :deep() .el-radio-group {
    display: flex;
    gap: 80px;
    row-gap: 24px;
}

.container :deep() .el-radio{
    align-items:flex-start;
}

.container :deep() .el-radio__inner::after {
    width: 12px;
    height: 12px;
    background-color: #f7941d;
}

.container :deep() .el-radio__input{
    padding-top:3px;
}

.container :deep() .el-radio__input.is-checked .el-radio__inner {
    border-color: #f7941d;
    background: #fff;
    border-width: 2px;
}

.container :deep() .el-checkbox-group {
    display: flex;
    gap: 40px;
    row-gap: 24px;
    flex-wrap: wrap;
}

.container :deep() .el-radio__inner {
    width: 24px;
    height: 24px;
    background-color: #fff;
    border: 1px solid #BFBFBF;
}

.positionR :deep() .el-select {
    width: 230px;
}

.positionR :deep() .el-select .el-input__inner {
    font-size: 16px;
    color: #0D0D0D;
    height: 40px;
    font-family: 'Poppins';
}

.container :deep() .el-input__wrapper {
    border-radius: 8px;
    border: 1px solid #BFBFBF;
    box-shadow: none;
}

.container :deep() .el-select .el-input .el-select__caret {
    font-size: 20px;
    color: #0D0D0D;
    font-weight: bold;
}

.boxContainer {
    width: 100%;
    max-width: 387px;
    border-radius: 8px;
    border: 1px solid #BFBFBF;
}

.boxHeader {
    display: flex;
    gap: 24px;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #BFBFBF;
    padding: 8px 16px;
}

.boxBody {
    padding: 8px 16px;
}

.bodyBox {
    display: flex;
    gap: 24px;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.container :deep() .el-checkbox {
    margin: 0px;
}

.container :deep() .el-checkbox__label {
    font-size: 20px;
    color: #0D0D0D;
    padding-left: 8px;
    font-family: 'Poppins';
}

.container :deep() .el-checkbox__inner {
    width: 18px;
    height: 18px;
    background-color: #F2F2F2;
    border: 1px solid #808080;
    border-radius: 2px;
}

.container :deep() .el-checkbox__input.is-checked .el-checkbox__inner {
    border-color: #f7941d;
    background-color: #f7941d;
}

.container :deep() .el-checkbox__inner::after {
    border: 2px solid #fff;
    border-left: 0;
    border-top: 0;
    height: 8px;
    left: 5px;
    top: 2px;
    width: 3px;
}

.editIconCont {
    display: flex;
    align-items: center;
    gap: 16px;
}

.editIcon {
    cursor: pointer;
}

@media (max-width: 1300px) {
    .gridCont {
        grid-template-columns: 1fr;
        padding: 0px 0px;
        height: auto;
        min-height: auto;
        gap: 40px;
    }

    .flexCont,
    .boxContainer {
        max-width: 100%;
    }
}
</style>