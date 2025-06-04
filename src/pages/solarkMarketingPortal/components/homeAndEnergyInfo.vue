<template>
    <div class="container" id="outerMostContainer">
        <div class="maxWidthContainer">
            <div class="headingFlex">
                <p class="heading">{{ heading }}</p>  
                <button class="resetBtn" @click="resetLocalStorage">Reset</button>
            </div>
            <div class="gridContainer">
                <div class="checkboxCont" v-if="isHomeInfoShow">
                    <div class="vehLabelCont">
                        <span class="demonstration" style="margin-top: 8px;">Zip Code</span>
                        <div class="locationFlex">
                            <div>
                                <input type="text" v-model="homeInfo.zipCode" class="milageInp" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                                <p class="zipCodeErrorMsg" v-show="zipCodeError">This field is required.</p>
                            </div>
                            <p class="currLocation" @click="getLocation()">Detect my location</p>
                        </div>
                    </div>
                    <div class="slider-demo-block">
                        <span class="right-info-span">
                            <div class="left-info-text">
                                <span class="demonstration ">What is your average monthly electricity bill?</span>
                            </div>
                            <div class="right-info">
                                <input disabled v-model="homeInfo.avgMonthlyBill" class="milageInp" style="width: 75%; margin-left: 10px; font-size: 1rem; font-weight: bold; text-align: end; height: 2rem; cursor:not-allowed" />
                                <p class="dollarSign ">$</p>
                            </div>
                        </span>
                        <div class="sliderNoCont">
                            <span class="checkBoxNo">$100</span>
                            <el-slider :max="500" :min="100" v-model="homeInfo.avgMonthlyBill"/>
                            <span class="checkBoxNo">$500</span>
                        </div>
                    </div>
                    <div class="slider-demo-block">
                        <span class="right-info-span">
                            <div class="left-info-text">
                                <span class="demonstration ">What is your average monthly energy consumption?</span>
                            </div>
                            <div class="right-info">
                                <input disabled v-model="homeInfo.avgMontlyEngConsump" class="milageInp " style="width: 75%; font-size: 1rem; font-weight: bold; margin-left: 10px; text-align: start; padding-left: 8px; height: 2rem; cursor:not-allowed" />
                                <span class="demonstration right-info-end" style="margin-left: 10px;">kWh</span>
                            </div>
                        </span>
                        
                        <div class="sliderNoCont">
                            <span class="checkBoxNo">100 kWh</span>
                            <el-slider  :max="4000" :min="100" :step="100" v-model="homeInfo.avgMontlyEngConsump"/>
                            <span class="checkBoxNo">4000 kWh</span>
                        </div>
                    </div>
                    <div class="slider-demo-block">
                        <span class="right-info-span">
                            <div class="left-info-text">
                                <span class="demonstration">What is the area of your home, including all floors?</span>
                            </div>
                            
                            <div class="right-info">
                                <input disabled type="number" v-model="homeInfo.homeAreaSq" class="milageInp" style=" width: 75%; margin-left: 10px; font-size: 1rem; font-weight: bold; text-align: start; padding-left: 8px; height: 2rem; cursor:not-allowed" />
                                <span class="demonstration right-info-end" style="margin-left: 10px;">sq. ft.</span>
                            </div>
                        </span>   
                        <div class="sliderNoCont">
                            <span class="checkBoxNo">500 sq. ft.</span>
                            <el-slider :max="6000" :min="500" :step="500" v-model="homeInfo.homeAreaSq" />
                            <span class="checkBoxNo">6000 sq. ft.</span>
                        </div>
                    </div>
                    <div class="slider-demo-block">
                        <span>
                            <span class="demonstration">Main panel rating</span>
                            <el-select v-model="homeInfo.AMPs" placeholder="Select" style="margin-left: 32px;">
                                <el-option
                                v-for="item in panelRatingOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                                </el-option>
                            </el-select>
                        </span>
                    </div>
                </div>
                <div class="checkboxCont checkboxContGap" v-if="isConsumpInfoPageOneShow" >
                    <div class="slider-demo-block slider-demo-block-gap">
                        <span class="demonstration">Do you have solar installed on your house?</span>
                        <el-radio-group v-model="energyConsumptionInfo.haveSolarInstalled" class="gapCheckBox" style="height:50px">
                            <el-radio label="Yes">Yes</el-radio>
                            <el-radio label="No">No</el-radio>
                            <div class="capacityKW" v-if="energyConsumptionInfo.haveSolarInstalled=='Yes'">
                                <p class="capKWLabel">Capacity</p>
                                <input type="text" placeholder="0" class="inpKW"
                                 v-model="energyConsumptionInfo.capInKw" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                                <p class="capKWLabel" >kW</p>
                            </div>
                            <p class="capacityErrorMessageClass" 
                                v-if="isCapErrorMsgVisible && energyConsumptionInfo.haveSolarInstalled=='Yes'">
                                This field is required
                            </p>
                        </el-radio-group>
                    </div>
                    <div class="slider-demo-block slider-demo-block-gap">
                        <span class="demonstration">Do you want solar installed?</span>
                        <el-radio-group v-model="energyConsumptionInfo.wantSolarInstalled" class="gapCheckBox">
                            <el-radio label="Yes">Yes</el-radio>
                            <el-radio label="No">No</el-radio>
                        </el-radio-group>
                    </div>
                    <div class="slider-demo-block electricVeh slider-demo-block-gap">
                        <span class="demonstration">How many electric vehicles (EVs) do you own or plan to own?</span>
                        <el-select v-model="energyConsumptionInfo.noOfElectricVehicles" placeholder="Select">
                                <el-option
                                v-for="item in electricVehiclesOptions"
                                :key="item"
                                :label="item"
                                :value="item">
                                </el-option>
                            </el-select>
                        <!-- <div class="sliderNoCont electricSlider">
                            <span class="checkBoxNo">0</span>
                            <el-slider :min="0" :max="5" v-model="energyConsumptionInfo.noOfElectricVehicles" />
                            <span class="checkBoxNo">5</span>
                        </div> -->
                    </div>
                    <div class="slider-demo-block slider-demo-block-gap"> 
                            <span class="demonstration">What is your average daily commute, using electric vehicles?
                            </span>
                            <span>
                                <input type="text" v-model="energyConsumptionInfo.avgCommute"
                                class="milageInp" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                                <span class="demonstration" style="margin-left:10px">Miles</span>
                            </span>
                    </div>

                    <!-- <div class="slider-demo-block vehLabelCont">
                        <span class="demonstration vehLabel"></span>
                        <div>
                            <div class="vehicleCont mTop">
                                <div class="vehFlexCont columnCont">
                                    <p class="vehHeading">Do you have a pool?</p>
                                    <el-checkbox-group v-model="energyConsumptionInfo.havePool" class="gapCheckBox">
                                        <el-checkbox label="Yes" />
                                        <el-checkbox label="No" checked />
                                    </el-checkbox-group>
                                </div>
                                <div class="vehFlexCont columnCont">
                                    <p class="vehHeading">Do you have an AC?</p>
                                    <el-checkbox-group v-model="energyConsumptionInfo.haveAC" class="gapCheckBox">
                                        <el-checkbox label="Yes" />
                                        <el-checkbox label="No" checked />
                                    </el-checkbox-group>
                                </div>
                                <div class="vehFlexCont columnCont">
                                    <p class="vehHeading">Which of the following appliances are electric? (select all that
                                        apply)</p>
                                    <el-checkbox-group v-model="energyConsumptionInfo.electricAppliances"
                                        class="gapCheckBox">
                                        <el-checkbox label="Water Heater" />
                                        <el-checkbox label="Stove Top" />
                                        <el-checkbox label="Heating" />
                                    </el-checkbox-group>
                                </div>
                            </div>
                        </div>
                    </div> -->
                </div>

                <div class="checkboxCont checkboxContGap" v-if="isConsumpInfoPageTwoShow">
                    <div class="slider-demo-block slider-demo-block-gap">
                        <span class="demonstration">What air conditioner do you have?</span>
                        <el-radio-group v-model="energyConsumptionInfo.typeOfAc" @change="acSelectionChanged"  class="gapCheckBox">
                            <el-radio label="Central HVAC">Central HVAC</el-radio>
                            <el-radio label="Mini Split">Mini Split</el-radio>
                            <el-radio label="None">None</el-radio>
                        </el-radio-group>
                        <!-- <el-radio-group v-model="energyConsumptionInfo.haveAC" @change="acSelectionChanged"  class="gapCheckBox">
                            <el-radio label="Yes">Yes</el-radio>
                            <el-radio label="No">No</el-radio>
                        </el-radio-group>
                        <div style="padding-left: 40px;" v-if="energyConsumptionInfo.haveAC == 'Yes'">
                            <el-radio-group v-model="energyConsumptionInfo.typeOfAc" @change="acSelectionChanged"  class="gapCheckBox">
                                <el-radio label="Central HVAC">Central HVAC</el-radio>
                                <el-radio label="Mini Split">Mini Split</el-radio>
                            </el-radio-group>
                        </div> -->
                    </div>
                    <div class="slider-demo-block slider-demo-block-gap">
                        <span class="demonstration">Do you have a pool?</span>
                        <el-radio-group v-model="energyConsumptionInfo.havePool" @change="poolSelectionChanged" class="gapCheckBox">
                            <el-radio label="Yes">Yes</el-radio>
                            <el-radio label="No">No</el-radio>
                        </el-radio-group>
                    </div>
                    <div class="slider-demo-block slider-demo-block-gap">
                        <span class="demonstration">Which Appliances are Electric?</span>
                        <div class="flexApplience">
                            <el-checkbox-group v-model="homeInfo.electricAppliances" @change="manageElectricalAppliances" class="gapCheckBox">
                                <el-checkbox label="Water Heater" />
                                <el-checkbox label="Stove Top" />
                                <el-checkbox label="Furnace" />
                                <el-checkbox label="Dryer" />
                                <el-checkbox label="Well Pump" />
                            </el-checkbox-group>
                            <p class="addAppl"  @click="openAdditionalConfigAndSendProp()">Additional configuration</p>
                        </div>
                    </div>
                    <div class="slider-demo-block slider-demo-block-gap">
                        <span class="demonstration">What is your backup power goal?</span>
                        <el-radio-group v-model="energyConsumptionInfo.powerBackupGoal" @change="backupPowerGoalChanged" class="gapCheckBox">
                            <el-radio label="Whole House Backup">Whole House Backup</el-radio>
                            <el-radio label="Essential Loads Only">Essential Loads Only</el-radio>
                            <el-radio label="Short Duration/Least Budget">Smallest Option</el-radio>
                        </el-radio-group>
                    </div>
                    <div class="slider-demo-block slider-demo-block-gap">
                        <span>
                            <span class="demonstration">How many days of backup do you need?</span>
                            <input type="text" v-model="energyConsumptionInfo.daysOfBackup" style="margin-left:10px"
                             @input="updateDaysOfBackup()" class="milageInp" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                            <span v-if="Number(energyConsumptionInfo.daysOfBackup)>1" class="demonstration" style="margin-left:10px">days</span>
                            <span v-else class="demonstration" style="margin-left:10px">day</span>

                        </span>
                        <p class="backupDaysMsg" style="margin-left:405px" v-show="backupDaysError">This field is required.</p>
                    </div>



                </div>
                <div class="imgsCont">
                    <div class="imgCont">
                        <img src="../assets/img/Sol-Ark-8K.png" class="img" />
                        <div class="imgContent"  v-loading="isLoading">
                            <div class="inverter-container">
                                <div class="info-container">
                                    <div>
                                        <p class="headingImg">Inverter</p>
                                        <p class="valImg" v-for="(data,index) in computedFinalInverters" :key="index">
                                            {{ index+1 }} ) {{ data['manufacturer'] }} {{data['size']}}K {{ data['make'] }} <span class="quantity"> &nbsp; x{{data['quantity']}}</span>
                                        </p>
                                        <p class="valImg" v-if="!Object.keys(computedFinalInverters).length">
                                            Sol-Ark (15K-2P)
                                        </p>
                                        <p v-if="finalOutput.count_of_inverter > 1">Quantity: {{ finalOutput.count_of_inverter }}</p>
                                        <p class="specSheet" @click="downloadInverter">View Spec Sheet</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="imgCont">
                        <img src="../assets/img/Untitled.png" class="img" />
                        <div class="imgContent" v-loading="isLoading">
                            <div >
                                <p class="headingImg">Featured Battery</p>
                                <p class="valImg" v-for="(data,index) in computedFinalBattery" :key="index">
                                   {{ index+1 }} ) {{ data['totalCapacity'] }} kWh {{ data['model'] }} <span class="quantity"> &nbsp; x{{data['quantity']}}</span>
                                    <!-- 20kWh Endur Energy ESP-BU20 -->
                                </p>
                                <p class="valImg" v-if="!Object.keys(computedFinalBattery).length">
                                    20kWh Endur Energy ESP-BU20 
                                </p>
                            </div>
                            <p class="specSheet" @click="downloadBattery">View Spec Sheet</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer">
            <div class="footerFlex">
                <div class="stepsFlex">
                    <p class="steps">{{ stepNo }}/3</p>
                    <div class="flexFooterBtn">
                        <el-button class="footerBackBtn" @click="backStep()" v-if="showBackBtn">Back</el-button>
                        <el-button class="footerNextBtn" @click="nextStep()" :loading="loadingStateButton">Next</el-button>
                    </div>
                </div>
                <p class="footerLine">> Disclaimer : This is a preliminary estimate based on input provided through this form.
                    Please consult with Sol-ark or a Sol-ark affiliated installer for a final recommendation.
                </p>
            </div>
        </div>
        <BasicInformationPopup v-if="isBasicInformationPopupVisible"
            :isBasicInformationPopupVisible="isBasicInformationPopupVisible"
            @close="isBasicInformationPopupVisible = false" />
    </div>
    <GMapAutocomplete v-show="false" placeholder="Your Current Location"
        ref="autocomplete" class="inputTag">
    </GMapAutocomplete>
    <EditEquipmentsPopup v-if="isEditEquipmentsPopupVisible"
            :isEditEquipmentsPopupVisible="isEditEquipmentsPopupVisible"
            @close="closeEditEquipmentsPopup()"
            @systemConfig="systemConfig" />
</template>


<script>

import { ref } from 'vue';
import BasicInformationPopup from './basicInformationPopup.vue';
import EditEquipmentsPopup from './editEquipmentsPopup.vue';
import API from '@/services/api';
import { saveAs } from 'file-saver';
export default {

    components: {
        BasicInformationPopup,
        EditEquipmentsPopup
    },

    data() {
        return {
            radio1: ref(''),
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
            electricVehiclesOptions:[0,1,2,3,4,5],
            homeInfo: {
                zipCode: "",
                avgMontlyEngConsump: 100,
                avgMonthlyBill: 100,
                homeAreaSq: 500,
                AMPs: 200,
                electricAppliances: [],
                coordinates:{
                    lat:'',
                    lng:'',
                }
            },
            energyConsumptionInfo: {
                haveSolarInstalled: "No",
                capInKw: null,
                wantSolarInstalled: "No",
                noOfElectricVehicles: 0,
                avgCommute: null,
                havePool: "No",
                haveAC: "No",
                typeOfAc: null,
                daysOfBackup: 1,
                powerBackupGoal:'Essential Loads Only'

            },
            isEditEquipmentsPopupVisible: false,
            value2: "",
            nextToNext: false,
            checkList: ['selected and disabled', 'Yes'],
            isHomeInfoShow: true,
            isConsumpInfoPageOneShow: false,
            isConsumpInfoPageTwoShow: false,
            stepNo: 1,
            heading: 'Tell me about your Home',
            showBackBtn: false,
            isBasicInformationPopupVisible: false,
            stepHere: false,
            radio: 3,
            idsListOfIncomingCriticalAppliances:[1,2,3,4,5,6,7,8,9],
            idsListOfIncomingTotalAppliances:[1,2,3,4,5,6,7,8,9],
            criticalListOfJson:[],
            totalLoadAppliances:[],
            backupDaysError: false,
            zipCodeError: false,
            finalOutput:{},
            isLoading:false,
            isDownloadRunning: false,
            loadingStateButton: false,
            isCapErrorMsgVisible:false,
            // additional_info_from_backend : JSON.parse(localStorage.getItem('additional-info-solark'))
        }
    },

    mounted() {
        if (this.$route.params.steps) {
            this.stepHere = this.$route.params.steps;
        } else {
            this.stepHere = false;
        }
        this.getResultOutputFromLS();
        if(!localStorage.getItem('current-page-no'))
        localStorage.setItem('current-page-no',JSON.stringify(1));
        else{
            let currentPageNo = JSON.parse(localStorage.getItem('current-page-no'))
            if(currentPageNo==1){
                this.isHomeInfoShow= true;
                this.isConsumpInfoPageTwoShow= false;
                this.isConsumpInfoPageOneShow=false;
                this.stepNo= 1;
                this.heading= 'Tell me about your Home';
                this.showBackBtn= false,
                this.stepHere= false;

                //get saved data from local storage to the fields of page 1
                let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'));
                this.homeInfo = JSON.parse(JSON.stringify(data['additional_info_for_frontend']['homeInfo']));
            }
            else if(currentPageNo==2){
                this.isHomeInfoShow = false;
                this.isConsumpInfoPageOneShow = true;
                this.isConsumpInfoPageTwoShow = false;
                this.stepNo = 2;
                console.log("Steps", this.$route.params.steps);
                this.heading = 'Tell me about your Solar and EV goals';
                this.showBackBtn = true;
                // this.adjustDataToSendForPage1();

                //get saved data from local storage to the fields of page 2
                let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'));
                let storedEnergyConsumptionInfo= JSON.parse(JSON.stringify(data['additional_info_for_frontend']['energyConsumptionInfo']));
                this.energyConsumptionInfo['haveSolarInstalled'] = storedEnergyConsumptionInfo['haveSolarInstalled']
                this.energyConsumptionInfo['capInKw'] = storedEnergyConsumptionInfo['capInKw'];
                this.energyConsumptionInfo['wantSolarInstalled'] = storedEnergyConsumptionInfo['wantSolarInstalled'];
                this.energyConsumptionInfo['noOfElectricVehicles'] = storedEnergyConsumptionInfo['noOfElectricVehicles'];
                this.energyConsumptionInfo['avgCommute'] = storedEnergyConsumptionInfo['avgCommute'];

            }
            else if(currentPageNo==3){
                this.isConsumpInfoPageTwoShow = true;
                this.isConsumpInfoPageOneShow = false;
                this.isHomeInfoShow= false;
                this.showBackBtn = true;
                this.heading = 'Tell me about your Solar and EV goals';
                this.stepNo = 3;
                this.initializeValuesFromLocalStorage();

                //get saved data from local storage to the fields of page 3 mainly daysOfBackup
                let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'));
                let storedEnergyConsumptionInfo= JSON.parse(JSON.stringify(data['additional_info_for_frontend']['energyConsumptionInfo']));
                this.energyConsumptionInfo['daysOfBackup'] = storedEnergyConsumptionInfo['daysOfBackup'];
            }
        }
        // this.tooltipColorFunc();
    },

    computed:{

        computedFinalBattery(){
            let finalArray = [];
            console.log(this.finalOutput);
            // if(Object.keys(this.finalOutput).length){
            //     let myData = this.finalOutput['suggested_battery '];
            //     console.log(myData);
            //     let size = 0;
            //     let count = 0;
            //     for(let i=0;i<myData.length;i++){
            //         if(!count){
            //             size = myData[i]['fields']['total_capacity_kWh'];
            //             finalArray.push({
            //                 'totalCapacity': myData[i]['fields']['total_capacity_kWh'],
            //                 'model': myData[i]['fields']['model'],
            //                 'quantity': 0,
            //                 'link': myData[i]['fields']['link'],
            //             });
            //             count++;
            //             finalArray[finalArray.length-1].quantity = count;
            //         } else {
            //             if(size == myData[i]['fields']['total_capacity_kWh']){
            //                 count++;
            //                 finalArray[finalArray.length-1].quantity = count;
            //             } else {
            //                 finalArray[finalArray.length-1].quantity = count;
            //                 size = myData[i]['fields']['total_capacity_kWh'];
            //                 count = 0;
            //                 finalArray.push({
            //                     'totalCapacity': myData[i]['fields']['total_capacity_kWh'],
            //                     'model': myData[i]['fields']['model'],
            //                     'quantity': 0,
            //                     'link': myData[i]['fields']['link'],
            //                 });
            //                 count++;
            //                 finalArray[finalArray.length-1].quantity = count;
            //             }
            //         }
            // }
            // }
            return finalArray;
        },

        computedFinalInverters(){
        let finalArray = [];
        // if(Object.keys(this.finalOutput).length){
        //    let myData = this.finalOutput['suggested_inverter_details'];
        //    let size = 0;
        //    let count = 0;
        //    for(let i=0;i<myData.length;i++){
        //     if(!count){
        //         size = myData[i]['fields']['Size'];
        //         finalArray.push({
        //             'manufacturer': myData[i]['fields']['Manufacturer'],
        //             'size': myData[i]['fields']['Size'],
        //             'make': myData[i]['fields']['Make'],
        //             'quantity': 0,
        //             'link': myData[i]['fields']['Source_link'],
        //         });
        //         count++;
        //         finalArray[finalArray.length-1].quantity = count;
        //     } else {
        //         if(size == myData[i]['fields']['Size']){
        //             count++;
        //             finalArray[finalArray.length-1].quantity = count;
        //         } else {
        //             finalArray[finalArray.length-1].quantity = count;
        //             size = myData[i]['fields']['Size'];
        //             count = 0;
        //             finalArray.push({
        //                 'manufacturer': myData[i]['fields']['Manufacturer'],
        //                 'size': myData[i]['fields']['Size'],
        //                 'make': myData[i]['fields']['Make'],
        //                 'quantity': 0,
        //                 'link': myData[i]['fields']['Source_link'],
        //             });
        //             count++;
        //             finalArray[finalArray.length-1].quantity = count;
        //         }
        //     }
        //    }
        // }
        console.log(finalArray);
        return finalArray;
        },

        additional_info_from_backend(){
            return JSON.parse(localStorage.getItem('additional-info-solark'))
        },
        JSONTofetchAppliancesFromID(){
            return JSON.parse(localStorage.getItem('id-mapping-appliances'))
        }
    },

    methods: {
        // tooltipColorFunc() {
        //     let tooltipColor = document.querySelectorAll('.el-popper');
        //     console.log('tooltipColor: ', tooltipColor);

        //     for (let i = 0; i < tooltipColor.length; i++) {
        //         tooltipColor[i].classList.remove('is-dark');
        //         tooltipColor[i].classList.add('is-light');
        //         tooltipColor[i].style.fontSize = "16px";
        //     }
        // },
        getResultOutputFromLS(){
            if(JSON.parse(localStorage.getItem('final-output')))
            this.finalOutput = JSON.parse(localStorage.getItem('final-output'));
        },
        async nextStep() {
            if (this.stepNo == 1) {
                    if(this.homeInfo.zipCode.length == 0) {
                    return this.zipCodeError = true;
                } else 
                this.zipCodeError = false;
                this.isHomeInfoShow = false;
                this.isConsumpInfoPageOneShow = true;
                this.stepNo = 2;
                console.log("Steps", this.$route.params.steps);
                this.heading = 'Tell me about your Solar and EV goals';
                this.showBackBtn = true;
                this.adjustDataToSendForPage1();
                localStorage.setItem('current-page-no',JSON.stringify(2));

                //get saved data from local storage to the fields of page 2
                let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'));
                let storedEnergyConsumptionInfo= JSON.parse(JSON.stringify(data['additional_info_for_frontend']['energyConsumptionInfo']));
                this.energyConsumptionInfo['haveSolarInstalled'] = storedEnergyConsumptionInfo['haveSolarInstalled']
                this.energyConsumptionInfo['capInKw'] = storedEnergyConsumptionInfo['capInKw'];
                this.energyConsumptionInfo['wantSolarInstalled'] = storedEnergyConsumptionInfo['wantSolarInstalled'];
                this.energyConsumptionInfo['noOfElectricVehicles'] = storedEnergyConsumptionInfo['noOfElectricVehicles'];
                this.energyConsumptionInfo['avgCommute'] = storedEnergyConsumptionInfo['avgCommute'];
            }
            else if (this.isConsumpInfoPageOneShow == true) {
                if(this.energyConsumptionInfo.haveSolarInstalled=='Yes' && !this.energyConsumptionInfo.capInKw>0){
                    this.isCapErrorMsgVisible = true;
                    return;
                }
                else{
                    this.isCapErrorMsgVisible = false;
                }

                this.adjustDataToSendForPage2();
                this.isConsumpInfoPageTwoShow = true;
                this.isConsumpInfoPageOneShow = false;
                this.initializeValuesFromLocalStorage();
                this.stepNo = 3;
                localStorage.setItem('current-page-no',JSON.stringify(3));

                //get saved data from local storage to the fields of page 3 mainly daysOfBackup
                let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'));
                let storedEnergyConsumptionInfo= JSON.parse(JSON.stringify(data['additional_info_for_frontend']['energyConsumptionInfo']));
                this.energyConsumptionInfo['daysOfBackup'] = storedEnergyConsumptionInfo['daysOfBackup'];
            }
            else if (this.stepNo == 3 && this.isConsumpInfoPageTwoShow == true) {
                if(this.energyConsumptionInfo.daysOfBackup.length == 0) {
                    return this.backupDaysError = true;
                } else if(JSON.parse(localStorage.getItem("userInfo"))) {
                    this.loadingStateButton = true;
                    await this.adjustDataToSendForPage3();
                    console.log("nextStep");
                    this.backupDaysError = false;
                    this.$router.push({ name: 'systemConfigRouteFile' });
                    this.loadingStateButton = false;
                } else {
                    this.loadingStateButton = true;
                    this.isBasicInformationPopupVisible = true;
                    await this.adjustDataToSendForPage3();
                    // this.isBasicInformationPopupVisible = true;
                    this.backupDaysError = false;
                    this.loadingStateButton = false;
                }
                
            }
        },

        backStep() {
            if (this.isConsumpInfoPageOneShow == true) {
                this.isHomeInfoShow = true;
                this.isConsumpInfoPageOneShow = false;
                this.stepNo = 1;
                this.heading = 'Tell me about your Home';
                this.showBackBtn = false;
                localStorage.setItem('current-page-no',JSON.stringify(1));

                //get saved data from local storage to the fields of page 1
                let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'));
                this.homeInfo = JSON.parse(JSON.stringify(data['additional_info_for_frontend']['homeInfo']));

            } else if(this.isConsumpInfoPageTwoShow == true) {
                this.isConsumpInfoPageOneShow = true;
                this.isConsumpInfoPageTwoShow = false;
                this.stepNo = 2;
                localStorage.setItem('current-page-no',JSON.stringify(2));

                //get saved data from local storage to the fields of page 2
                let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'));
                let storedEnergyConsumptionInfo= JSON.parse(JSON.stringify(data['additional_info_for_frontend']['energyConsumptionInfo']));
                this.energyConsumptionInfo['haveSolarInstalled'] = storedEnergyConsumptionInfo['haveSolarInstalled']
                this.energyConsumptionInfo['capInKw'] = storedEnergyConsumptionInfo['capInKw'];
                this.energyConsumptionInfo['wantSolarInstalled'] = storedEnergyConsumptionInfo['wantSolarInstalled'];
                this.energyConsumptionInfo['noOfElectricVehicles'] = storedEnergyConsumptionInfo['noOfElectricVehicles'];
                this.energyConsumptionInfo['avgCommute'] = storedEnergyConsumptionInfo['avgCommute'];
            }

        },

        getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.showPosition, this.locationFetchFail);
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        },

        showPosition(position) {
            this.homeInfo.coordinates = {
                "lat": position.coords.latitude,
                "lng": position.coords.longitude
            }
            var geocoder = new google.maps.Geocoder();
            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var vm = this;
            if (geocoder) {
                geocoder.geocode({ 'latLng': latLng }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        for (let i = 0; i < results.length; i++) {
                            let getZipCode = results[i].address_components.filter((elements) => {
                            if (elements.types[0] == 'postal_code') {
                                vm.homeInfo.zipCode = elements.long_name;
                            }
                        })
                        break;
                        }
                    }
                    else {
                        console.log("Geocoding failed: " + status);
                    }
                });
            }
        },
        resetLocalStorage(){
            localStorage.removeItem('jsonToSendForCalculation');
            localStorage.removeItem('all-incoming-appliances');
            localStorage.removeItem('id-mapping-appliances');
            localStorage.removeItem('additional-info-solark');
            localStorage.removeItem('current-page-no');
            localStorage.removeItem('final-output');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('current-page-no');

            this.isHomeInfoShow = true;
            this.isConsumpInfoPageOneShow = false;
            this.isConsumpInfoPageTwoShow= false;
            this.stepNo = 1;
            this.heading = 'Tell me about your Home';
            this.showBackBtn = false;
            // localStorage.setItem('current-page-no',JSON.stringify(1));

            // on reset, clear first page field
            this.homeInfo= {
                zipCode: "",
                avgMontlyEngConsump: 100,
                avgMonthlyBill: 100,
                homeAreaSq: 500,
                AMPs: 200,
                electricAppliances: [],
                coordinates:{
                    lat:'',
                    lng:'',
                }
            };
            this.energyConsumptionInfo={
                haveSolarInstalled: "No",
                capInKw: null,
                wantSolarInstalled: "No",
                noOfElectricVehicles: 0,
                avgCommute: null,
                havePool: "No",
                haveAC: "No",
                typeOfAc: null,
                daysOfBackup: 1,
                powerBackupGoal:'Essential Loads Only',
            }
            this.finalOutput={};
            this.$emit('onReset');
        },
        initializeValuesFromLocalStorage(){
            let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
            // id of an central HVAC is 11 and mini split AC is 32
            let indexOfAC= data['final_total_appliances'].findIndex((item)=> item.id ==11)
            let indexOfMiniAC = data['final_total_appliances'].findIndex((item)=> item.id ==32)
            if(indexOfAC>=0 || indexOfMiniAC>=0){
                // this.energyConsumptionInfo.haveAC='Yes';
                if(indexOfAC>=0)
                    this.energyConsumptionInfo.typeOfAc='Central HVAC'
                else if(indexOfMiniAC>=0)
                    this.energyConsumptionInfo.typeOfAc='Mini Split'
            }
            else{
                // this.energyConsumptionInfo.haveAC='No';
                this.energyConsumptionInfo.typeOfAc='None';
            }

            let indexOfpool= data['final_total_appliances'].findIndex((item)=> item.id ==12)
            if(indexOfpool>=0)
            this.energyConsumptionInfo.havePool='Yes';
            else
            this.energyConsumptionInfo.havePool='No';

            let indexOfEWH = data['final_total_appliances'].findIndex((item)=> item.id ==13)
            if(indexOfEWH>=0){
                if(!this.homeInfo.electricAppliances.includes('Water Heater'))
                this.homeInfo.electricAppliances.push('Water Heater')
            }
            else{
                let index = this.homeInfo.electricAppliances.indexOf('Water Heater')
                if(index>=0)
                this.homeInfo.electricAppliances.splice(index,1);
            }

            let indexOfCR = data['final_total_appliances'].findIndex((item)=> item.id ==14)
            if(indexOfCR>=0){
                if(!this.homeInfo.electricAppliances.includes('Stove Top'))
                this.homeInfo.electricAppliances.push('Stove Top')
            }
            else{
                let index = this.homeInfo.electricAppliances.indexOf('Stove Top')
                if(index>=0)
                this.homeInfo.electricAppliances.splice(index,1);
            }

            let indexOfFurnace = data['final_total_appliances'].findIndex((item)=> item.id ==15)
            if(indexOfFurnace>=0){
                if(!this.homeInfo.electricAppliances.includes('Furnace'))
                this.homeInfo.electricAppliances.push('Furnace')
            }
            else{
                let index = this.homeInfo.electricAppliances.indexOf('Furnace')
                if(index>=0)
                this.homeInfo.electricAppliances.splice(index,1);
            }


            let indexOfWellPump = data['final_total_appliances'].findIndex((item)=> item.id ==30)
            if(indexOfWellPump>=0){
                if(!this.homeInfo.electricAppliances.includes('Well Pump'))
                this.homeInfo.electricAppliances.push('Well Pump')
            }
            else{
                let index = this.homeInfo.electricAppliances.indexOf('Well Pump')
                if(index>=0)
                this.homeInfo.electricAppliances.splice(index,1);
            }

            let indexOfDryer = data['final_total_appliances'].findIndex((item)=> item.id ==16)
            if(indexOfDryer>=0){
                if(!this.homeInfo.electricAppliances.includes('Dryer'))
                this.homeInfo.electricAppliances.push('Dryer')
            }
            else{
                let index = this.homeInfo.electricAppliances.indexOf('Dryer')
                if(index>=0)
                this.homeInfo.electricAppliances.splice(index,1);
            }
            this.energyConsumptionInfo.powerBackupGoal = data['additional_info_for_frontend']['energyConsumptionInfo']['powerBackupGoal'];
        },  
        openAdditionalConfigAndSendProp(){
            let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
            this.criticalListOfJson = JSON.parse(JSON.stringify(data['final_critical_list'])); 
            this.totalLoadAppliances = JSON.parse(JSON.stringify(data['final_total_appliances'])); 
            this.isEditEquipmentsPopupVisible = true;
        },
        adjustDataToSendForPage1(){
            let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
            console.log("data for page 1",data);
            data['daily_energy_consumption_kwh'] = this.homeInfo.avgMontlyEngConsump/30;
            data['pv_size_kw'] = (data['daily_energy_consumption_kwh']/this.additional_info_from_backend[0]['operational_hour_of_sun'])/0.85  // considering 85% efficiency;
            data['monthly_bill'] = this.homeInfo.avgMonthlyBill;
            data['area_in_sqft'] = this.homeInfo.homeAreaSq;
            data['max_caping_of_inverter_kw'] = (this.homeInfo.AMPs * this.additional_info_from_backend[0]['home_voltage_supply'])/1000;
            data['coordinates'] = this.homeInfo.coordinates;
            let idMappingAppliances = JSON.parse(localStorage.getItem('id-mapping-appliances'))
            // Now, we want to push json in the critical and total appliances only when it is empty i.e first time
            if(data['final_critical_list'].length==0){
                for(let i=0;i<this.idsListOfIncomingCriticalAppliances.length;i++){
                    data['final_critical_list'].push(idMappingAppliances[this.idsListOfIncomingCriticalAppliances[i]]);
                }
            }
            if(data['final_total_appliances'].length==0){
                for(let i=0;i<this.idsListOfIncomingTotalAppliances.length;i++){
                    data['final_total_appliances'].push(idMappingAppliances[this.idsListOfIncomingTotalAppliances[i]]);
                }
            }
            console.log("final data to send for page 1",data);
            localStorage.setItem('jsonToSendForCalculation',JSON.stringify(data));

            // now save additional information for frontend (to save it on reload)
            // data['additional_info_for_frontend'] = {};
            data['additional_info_for_frontend']['homeInfo'] = JSON.parse(JSON.stringify(this.homeInfo)) ;
            localStorage.setItem('jsonToSendForCalculation',JSON.stringify(data));

            // this.fetchCalculationFromBackend(data);

        },
        adjustDataToSendForPage2(){
            let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
            let totalDistanceForGivenConsumption = this.additional_info_from_backend[0]['ev_json']['distance'];
            let totalConsumptionForGivenDistance = this.additional_info_from_backend[0]['ev_json']['battery_consumed'];
            let totalEnergyConsumedForEnteredDistance = this.energyConsumptionInfo.noOfElectricVehicles * this.energyConsumptionInfo.avgCommute *
             (totalConsumptionForGivenDistance/totalDistanceForGivenConsumption)

            // now creating a json to append in final_total_appliances and not in final_critical_list as it is not critical right now. 
            // now id of EV is 10
            let evJSON = this.JSONTofetchAppliancesFromID['10'];
            evJSON['final_consumption'] = totalEnergyConsumedForEnteredDistance;
            evJSON['quantity'] = this.energyConsumptionInfo.noOfElectricVehicles;
            let indexOfEV= data['final_total_appliances'].findIndex((item)=> item.id ==10)
            // to avoid the duplicacy of EV data, we first check whether it exists and if so, we will remove it and then push the latest one.
            if(indexOfEV>=0){
                data['final_total_appliances'].splice(indexOfEV,1);
            }
            data['final_total_appliances'].push(evJSON);

            // Also 1 imp thing, as we introduced 2 new fields in EV json - final_consumption and quantity, we need to update 
            // id mapping json in local storage
            let updatedJSONTofetchAppliancesFromID = this.JSONTofetchAppliancesFromID;
            updatedJSONTofetchAppliancesFromID['10'] = evJSON;
            localStorage.setItem('id-mapping-appliances',JSON.stringify(updatedJSONTofetchAppliancesFromID));


            // also, if the user mentioned that he already has PV size and mentioned the capacity then we need to subtract this from our
            // current calculated PV size from frontend
            data['pv_size_kw'] = data['pv_size_kw'] - this.energyConsumptionInfo.capInKw;
            console.log("final data to send for page 2",data);
            localStorage.setItem('jsonToSendForCalculation',JSON.stringify(data));


            // now save additional information for frontend (to save it on reload)
            // data['additional_info_for_frontend'] = {};
            data['additional_info_for_frontend']['energyConsumptionInfo'] = JSON.parse(JSON.stringify(this.energyConsumptionInfo)) ;
            localStorage.setItem('jsonToSendForCalculation',JSON.stringify(data));
            // this.fetchCalculationFromBackend(data);
        },
        async adjustDataToSendForPage3(){
            let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
            data['no_of_days_of_backup'] = this.energyConsumptionInfo.daysOfBackup;
            localStorage.setItem('jsonToSendForCalculation',JSON.stringify(data));
            let response = await this.fetchCalculationFromBackend(data);
            console.log("adjustDataToSendForPage3");
            return 3;
        },
        async fetchCalculationFromBackend(payload){
            this.isLoading=true;
            let response =  await API.SOLARK.FETCH_CALCULATION(payload);
            localStorage.setItem('final-output',JSON.stringify(response.data));
            this.finalOutput = response.data;
            this.isLoading=false;
            return 1;
        },
        acSelectionChanged(){
            let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
            // id of an central HVAC is 11 and mini split is 32
            let acJSON = this.JSONTofetchAppliancesFromID['11'];
            let miniSplitACJSON = this.JSONTofetchAppliancesFromID['32'];
            //------------------If already AC remove it -------------------------//
            let indexOfAC= data['final_total_appliances'].findIndex((item)=> item.id ==11)
            if(indexOfAC>=0){
                data['final_total_appliances'].splice(indexOfAC,1);
            }
            let indexOfMiniAC= data['final_total_appliances'].findIndex((item)=> item.id ==32)
            if(indexOfMiniAC>=0){
                data['final_total_appliances'].splice(indexOfMiniAC,1);
            }
            // if(this.energyConsumptionInfo.haveAC=='No'){
            //     this.energyConsumptionInfo.typeOfAc=null;
            // }
            //-------------Now if AC is Yes, Add it------------------------------//
            if(this.energyConsumptionInfo.haveAC!='None'){
                if(!this.energyConsumptionInfo.typeOfAc){
                    this.energyConsumptionInfo.typeOfAc='Central HVAC';
                    data['final_total_appliances'].push(acJSON); // if not selected any option by default, then choose central HVAC
                }
                else{
                    if(this.energyConsumptionInfo.typeOfAc=='Central HVAC')
                        data['final_total_appliances'].push(acJSON);
                    else if(this.energyConsumptionInfo.typeOfAc=='Mini Split'){
                        data['final_total_appliances'].push(miniSplitACJSON);
                    }    
                }
            }
            console.log("after changing ac",data);
            localStorage.setItem('jsonToSendForCalculation',JSON.stringify(data));
        },
        backupPowerGoalChanged(){
            let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
            data['additional_info_for_frontend']['energyConsumptionInfo'] = JSON.parse(JSON.stringify(this.energyConsumptionInfo));
            localStorage.setItem('jsonToSendForCalculation',JSON.stringify(data));
        },
        poolSelectionChanged(){
            let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
            // id of a pool is 12
            let poolJSON = this.JSONTofetchAppliancesFromID['12'];
            //------------------If already pool remove it -------------------------//
            let indexOfpool= data['final_total_appliances'].findIndex((item)=> item.id ==12)
            if(indexOfpool>=0){
                data['final_total_appliances'].splice(indexOfpool,1);
            }
            //-------------Now if pool is Yes, Add it------------------------------//
            if(this.energyConsumptionInfo.havePool=='Yes'){
                data['final_total_appliances'].push(poolJSON);
            }
            localStorage.setItem('jsonToSendForCalculation',JSON.stringify(data));
        },
        manageElectricalAppliances(){
            // here are some complicated stuffs
            // Non electrical(NE) and Electrical(E)
            // id of Gas water heater(NE) - 3 and id of electrical water heater(E) - 13
            // id of Gas Cook Top Stove(NE) - 2 and id of Stove Top(E) - 14
            // id of Furnace (E) - 15
            // id of Well Pump(E) - 30
            // id of Gas Dryer(NE) - 1 and id of Clother Dryer(E) - 16

            // if we come here for the first time, it means in the critical and final appliances list, it consists 
            // json of ids [3,2,1], not just this but also this
            // now to make sure everything is working in everycase we will first reset everything related to this
            //now what is the reset state? in the reset state or the first time 
            // critical list = [1,2,3,.....] and final list = [1,2,3,.....]
            // adding id 13 means - critical list = [1,2,.....] and final list = [1,2,13,.....]
            // and removing id 13 means - critical list = [1,2,3,.....] and final list = [1,2,3,.....]
            // Why? because here, (E) are not critical right now. It just that it should be in the final list when selected.
            // similarly for ids 1 and 2

            // So now reseting it means making sure that critical list = [1,2,3,.....] and final list = [1,2,3,.....] and no [13,14,15,16,30] in final list
            let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
            let EWHJson = this.JSONTofetchAppliancesFromID['13']; // electric water heater
            let CRJson = this.JSONTofetchAppliancesFromID['14']; // Stove Top
            let FurnaceJson = this.JSONTofetchAppliancesFromID['15']; 
            let WellPumpJson = this.JSONTofetchAppliancesFromID['30'];
            let CDJson = this.JSONTofetchAppliancesFromID['16']; //Clother Dryer

            let GWHJson = this.JSONTofetchAppliancesFromID['3']; // Gas water heater
            let GCTSJson = this.JSONTofetchAppliancesFromID['2']; // Gas Cook top stove
            let GDJson = this.JSONTofetchAppliancesFromID['1']; // Gas Dryer

            // step 1- remove [13,14,15,16,30] from total final list and critical list as well if there is any
            let EArray = [13,14,15,16,30]
            for(let i=0;i<EArray.length;i++){
                let index = data['final_total_appliances'].findIndex((item)=> item.id ==EArray[i])
                if(index>=0){
                    data['final_total_appliances'].splice(index,1);
                }
                let index2 = data['final_critical_list'].findIndex((item)=> item.id ==EArray[i])
                if(index2>=0){
                    data['final_total_appliances'].splice(index2,1);
                }
            }
            // step 2 - make sure that [1,2,3] are present in both critical and total appliances 
            // and first check if they are not present then only add
            let NEArray = [1,2,3]
            for(let i=0;i<NEArray.length;i++){
                let index1 = data['final_total_appliances'].findIndex((item)=> item.id ==NEArray[i])
                let index2 = data['final_critical_list'].findIndex((item)=> item.id ==NEArray[i])
                if(index1<0){
                    data['final_total_appliances'].push(this.JSONTofetchAppliancesFromID[NEArray[i]]);
                }
                if(index2<0){
                    data['final_critical_list'].push(this.JSONTofetchAppliancesFromID[NEArray[i]]);
                }
            }
            // so till here, its confirmed that [1,2,3] in both the lists
            // step 3 - Now we will see the array homeInfo.electricAppliances and we need to use the hard coded names here
            // based on which (E) appliances are present in the array, will add those ids in the   final_total_appliances
            // and remove the corresponding (NE) from both the lists

            data = JSON.parse(JSON.stringify(data));
            //---------------------- check for Water heater-----------------------------------------//
            if(this.homeInfo.electricAppliances.includes('Water Heater')){
                // remove 3 from both lists and add 13 to final_total_appliances list
                let index1 = data['final_total_appliances'].findIndex((item)=> item.id ==3)
                let index2 = data['final_critical_list'].findIndex((item)=> item.id ==3)
                if(index1>=0)
                data['final_total_appliances'].splice(index1,1);
                if(index2>=0)
                data['final_critical_list'].splice(index2,1);

                let index3 = data['final_total_appliances'].findIndex((item)=> item.id ==13)
                if(index3<0)
                data['final_total_appliances'].push(EWHJson)
            }
            else{
                // remove 13 from both the list and add 3 to both lists
                let index1 = data['final_total_appliances'].findIndex((item)=> item.id ==13)
                if(index1>=0)
                data['final_total_appliances'].splice(index1,1);

                let index4 = data['final_critical_list'].findIndex((item)=> item.id ==13)
                if(index4>=0)
                data['final_critical_list'].splice(index4,1);

                let index2 = data['final_total_appliances'].findIndex((item)=> item.id ==3)
                let index3 = data['final_critical_list'].findIndex((item)=> item.id ==3)

                if(index2<0)
                data['final_total_appliances'].push(GWHJson)
                if(index3<0)
                data['final_critical_list'].push(GWHJson)
            }
            //------------------------------END---------------------------------------------------//

            //------------------------- check for Stove Top--------------------------------------//
            if(this.homeInfo.electricAppliances.includes('Stove Top')){
                // remove 2 from both lists and add 14 to final_total_appliances list
                let index1 = data['final_total_appliances'].findIndex((item)=> item.id ==2)
                let index2 = data['final_critical_list'].findIndex((item)=> item.id ==2)
                if(index1>=0)
                data['final_total_appliances'].splice(index1,1);
                if(index2>=0)
                data['final_critical_list'].splice(index2,1);

                let index3 = data['final_total_appliances'].findIndex((item)=> item.id ==14)
                if(index3<0)
                data['final_total_appliances'].push(CRJson)
            }
            else{
                // remove 14 from final_total_appliances and add 2 to both lists
                let index1 = data['final_total_appliances'].findIndex((item)=> item.id ==14)
                if(index1>=0)
                data['final_total_appliances'].splice(index1,1);

                let index4 = data['final_critical_list'].findIndex((item)=> item.id ==14)
                if(index4>=0)
                data['final_critical_list'].splice(index4,1);

                
                let index2 = data['final_total_appliances'].findIndex((item)=> item.id ==2)
                let index3 = data['final_critical_list'].findIndex((item)=> item.id ==2)

                if(index2<0)
                data['final_total_appliances'].push(GCTSJson)
                if(index3<0)
                data['final_critical_list'].push(GCTSJson)
            }

            //------------------------------END---------------------------------------------------//


            //--------------------------- check for Dryer-----------------------------------------//
            if(this.homeInfo.electricAppliances.includes('Dryer')){
                // remove 1 from both lists and add 16 to final_total_appliances list
                let index1 = data['final_total_appliances'].findIndex((item)=> item.id ==1)
                let index2 = data['final_critical_list'].findIndex((item)=> item.id ==1)
                if(index1>=0)
                data['final_total_appliances'].splice(index1,1);
                if(index2>=0)
                data['final_critical_list'].splice(index2,1);


                let index3 = data['final_total_appliances'].findIndex((item)=> item.id ==16)
                if(index3<0)
                data['final_total_appliances'].push(CDJson)
            }
            else{
                // remove 16 from final_total_appliances and add 1 to both lists
                let index1 = data['final_total_appliances'].findIndex((item)=> item.id ==16)
                if(index1>=0)
                data['final_total_appliances'].splice(index1,1);

                let index4 = data['final_critical_list'].findIndex((item)=> item.id ==16)
                if(index4>=0)
                data['final_critical_list'].splice(index4,1);

                let index2 = data['final_total_appliances'].findIndex((item)=> item.id ==1)
                let index3 = data['final_critical_list'].findIndex((item)=> item.id ==1)

                if(index2<0)
                data['final_total_appliances'].push(GDJson)
                if(index3<0)
                data['final_critical_list'].push(GDJson)
            }
            //------------------------------END---------------------------------------------------//

            //---------------------------- Check For Furnace---------------------------------//
            if(this.homeInfo.electricAppliances.includes('Furnace')){
                // It just involves final_total_appliances list
                let index1 = data['final_total_appliances'].findIndex((item)=> item.id ==15)
                if(index1<0)
                data['final_total_appliances'].push(FurnaceJson)
            }
            else{
                // remove 15 i.e furnace from final_total_appliances list
                let index1 = data['final_total_appliances'].findIndex((item)=> item.id ==15)
                if(index1>=0)
                data['final_total_appliances'].splice(index1,1);

                let index4 = data['final_critical_list'].findIndex((item)=> item.id ==15)
                if(index4>=0)
                data['final_critical_list'].splice(index4,1);
            }
            //------------------------------END---------------------------------------------------//   


            //---------------------------- Check For Well Pump Motor---------------------------------//
            if(this.homeInfo.electricAppliances.includes('Well Pump')){
                // It just involves final_total_appliances list
                let index1 = data['final_total_appliances'].findIndex((item)=> item.id ==30)
                if(index1<0)
                data['final_total_appliances'].push(WellPumpJson)
            }
            else{
                // remove 30 i.e well pump from final_total_appliances list
                let index1 = data['final_total_appliances'].findIndex((item)=> item.id ==30)
                if(index1>=0)
                data['final_total_appliances'].splice(index1,1);

                let index4 = data['final_critical_list'].findIndex((item)=> item.id ==30)
                if(index4>=0)
                data['final_critical_list'].splice(index4,1);
            }
            //------------------------------END---------------------------------------------------//   
            console.log("after changing",data)
            localStorage.setItem('jsonToSendForCalculation',JSON.stringify(data));
        },
        closeEditEquipmentsPopup(){
            this.initializeValuesFromLocalStorage();
            this.isEditEquipmentsPopupVisible = false;
        },
        updateDaysOfBackup(){
            let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
            data['additional_info_for_frontend']['energyConsumptionInfo'] = JSON.parse(JSON.stringify(this.energyConsumptionInfo));
            localStorage.setItem('jsonToSendForCalculation',JSON.stringify(data));
        },
        getAllBatteryUrls(){
            let urls=[];
            if(Object.keys(this.computedFinalBattery).length){
                for( let item of this.computedFinalBattery ){
                    if(item['link']){
                            urls.push(item['link'])
                        }
                }
            }
            else{
                urls=['https://s3.ap-south-1.amazonaws.com/componentpdf/DataSheet_ESP-IBU20.pdf'];
            }
            return urls;
        },
        getAllInverterUrls(){
            let urls=[];
            if(Object.keys(this.computedFinalInverters).length){
                for( let item of this.computedFinalInverters ){
                        if(item['link']){
                            urls.push(item['link'])
                        }
                }
            }
            else{
                urls =['https://drive.google.com/file/d/1yzsn6hv_6wAjWw5-tMrjpfeMk37J8ieV/view'];
            }
            return urls;
        },
        downloadBattery(){
            let urls = this.getAllBatteryUrls();
            for (let fileUrl of urls) {
                let splitArray = fileUrl.split('?')[0].split('/')
                let fileName = splitArray[splitArray.length - 1]
                saveAs(fileUrl, fileName)
            }
        },
        downloadInverter(){
            let urls = this.getAllInverterUrls();
            for (let fileUrl of urls) {
                let splitArray = fileUrl.split('?')[0].split('/')
                let fileName = splitArray[splitArray.length - 1]
                saveAs(fileUrl, fileName)
            }
        },
    },

    watch: {
        stepHere: {
            handler(val, old) {
                console.log("Inside home and energy", old, val);
                if (this.$route.params.steps == val) {
                    this.isHomeInfoShow = false;
                    this.isConsumpInfoPageOneShow = false;
                    this.isConsumpInfoPageTwoShow = true;
                    this.stepNo = 3;
                    this.heading = 'Tell me about your Solar and EV goals';
                    this.showBackBtn = true;
                }
            }
        },

    }
}

</script>



<style scoped>
.right-info-span{
    position: relative;
}
.right-info{
    position: absolute;
    right: -25px;
    top: 0;
    line-height: 10px;
}
.right-info-end{
    position: absolute;
    font-size: 1rem !important;
    right: 35px;
    bottom: 10px;
}
@media only screen and (max-width: 1280px) {
  .left-info-text{
    width: 70% !important; 
  }
} 

p,
span,
div,
h1,
h2,
h3,
h4,
button,
a {
    font-family: 'Poppins';
}

.backupDaysMsg,
.zipCodeErrorMsg {
    color: rgb(253, 71, 71);
    font-size: 14px;
    margin-top: -16px;
}

.zipCodeErrorMsg {
    margin-top: 4px;
}

.quantity {
    color: #777;
}

.container {
    width: 100%;
    min-height: calc(100vh - 96px);
    background-color: #184d93;
}

.maxWidthContainer {
    width: 90%;
    margin: 0px auto;
}

.headingFlex {
    display: flex;
    align-items: center;
    gap: 24px;
}

.heading {
    font-size: 48px;
    font-weight: bold;
    color: #f7941d;
    padding-top: 24px;
    margin-bottom: 24px;
}

.gridContainer {
    display: grid;
    grid-template-columns: 60% auto;
    gap: 40px;
    align-items: flex-start;
    justify-content: space-between;
    padding-bottom: 100px;
}

.checkboxCont {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.checkboxContGap {
    gap: 24px;
}

.slider-demo-block {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    align-items: center;
}

.electricVeh {
    grid-template-columns: 0.8fr;
}

.slider-demo-block-gap {
    gap: 24px;
}


.flexStart {
    align-items: flex-start;
}

.flexBottom {
    align-items: flex-end;
}

.flexBottomLabel {
    margin-bottom: 24px;
}

.vehLabelCont {
    display: flex;
    gap: 60px;
}

.vehLabel {
    margin-top: 20px;
}

.demonstration,
.checkBoxNo {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
}

.sliderLine {
    font-size: 20px;
    margin-bottom: 16px;
    color: #fff;
}

.sliderNoCont {
    display: grid;
    grid-template-columns: 108px auto 120px;
    gap: 24px;
    align-items: center;
    width: 100%;
    height: 68px;
    padding: 0px 30px;
    background: #016ead;
    border-radius: 36px;
}

.electricSlider {
    grid-template-columns: 30px auto 40px;
}

.checkboxCont :deep() .el-slider__bar {
    height: 12px;
    background-color: #fff;
    border-radius: 6px;
}

.checkboxCont :deep() .el-slider__runway {
    height: 12px;
    border-radius: 6px;
    background-color: #184d93;
}

.checkboxCont :deep() .el-slider__button {
    width: 32px;
    height: 32px;
    border: 10px solid #f7941d;
    margin-top: 5px;
}

.checkboxCont :deep() .el-checkbox__inner {
    width: 24px;
    height: 24px;
    background-color: #184d93;
    border: 2px solid #fff;
    border-radius: 6px;
}

.checkboxCont :deep() .el-checkbox__input.is-checked .el-checkbox__inner {
    border-color: #f7941d;
}

.checkboxCont :deep() .el-radio-group {
    display: flex;
    gap: 80px;
    row-gap: 24px;
}

.checkboxCont :deep() .el-radio__inner::after {
    width: 12px;
    height: 12px;
    background-color: #f7941d;
}

.checkboxCont :deep() .el-radio__input.is-checked .el-radio__inner {
    border-color: #f7941d;
    background: #184d93;
    border-width: 2px;
}

.checkboxCont :deep() .el-checkbox-group {
    display: flex;
    gap: 40px;
    row-gap: 24px;
    flex-wrap: wrap;
}

.vehFlexCont :deep() .el-checkbox-group {
    gap: 24px;
}

.vehFlexCont :deep() .gapCheckBox {
    gap: 48px;
}

.checkboxCont :deep() .el-checkbox__inner::after {
    border: 3px solid #f7941d;
    border-left: 0;
    border-top: 0;
    height: 10px;
    left: 7px;
    top: 3px;
    width: 3px;
}

.checkboxCont :deep() .el-radio__label {
    font-size: 20px;
    color: #fff;
    padding-left: 10px;
}

.checkboxCont :deep() .el-radio__inner {
    width: 24px;
    height: 24px;
    background-color: #184d93;
    border-width: 2px;
}

.checkboxCont :deep() .el-checkbox__label {
    font-size: 20px;
    color: #fff;
    padding-left: 10px;
}

.checkboxCont :deep() .el-select {
    width: 120px;
}

.checkboxCont :deep() .el-input__wrapper {
    background-color: #184d93;
    border-radius: 8px;
    padding: 1px 16px;
}

.checkboxCont :deep() .el-input__inner {
    height: 50px;
    font-size: 20px;
    color: #fff;
}
.checkboxCont :deep() .el-select .el-input .el-select__caret {
    font-size: 24px;
    font-weight: bold;
    color: #fff;
}

.checkboxCont :deep() .el-select-dropdown__list {
    background: #184d93;
}

.checkboxCont :deep() .el-select-dropdown__item {
    color: #fff;
}

.checkboxCont :deep() .el-select-dropdown__item.hover,
.checkboxCont :deep()  .el-select-dropdown__item:hover {
    color: #222;
}

.vehicleCont {
    display: flex;
    flex-direction: column;
    margin-top: 20px;
}

.mTop {
    margin-top: -8px;
}

.vehFlexCont {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    padding: 12px 0px;
    border-bottom: 1px solid #016ead;
    ;
}

.vehFlexCont:last-child {
    border-bottom: none;
}

.columnCont {
    flex-direction: column;
    border: none;
    align-items: flex-start;
}

.vehHeading {
    font-size: 18px;
    color: #fff;
}

.flexApplience {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.addAppl {
    width: max-content;
    padding: 10px 16px;
    border-radius: 8px;
    background-color: #016ead;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
}

.addAppl::before {
    content: "";
    display: block;
    background: url("../assets/img/Gear.png") no-repeat;
    width: 24px;
    height: 24px;
    float: left;
    margin: 2px 6px 0 0;
}

.milageInp {
    width: 100%;
    max-width: 140px;
    height: 48px;
    border-radius: 8px;
    border: 2px solid #fff;
    background-color: #184d93;
    padding: 0px 16px;
    font-size: 20px;
    color: #fff;
    text-align: center;
    outline: none;
}

.relativeClass {
    position: relative;
    display: inline-block;
}

.dollarSign {
    position: absolute;
    top: 12px;
    left: 22px;
    color: #fff;
    font-size: 1rem;
    font-weight: bold;
}

.locationFlex {
    display: flex;
    gap: 24px;
}

.currLocation {
    font-size: 16px;
    color: #fff;
    text-decoration: underline;
    cursor: pointer;
    margin-top: 12px;
}

.currLocation::before {
    content: "";
    display: block;
    background: url("../assets/img/location_searching.svg") no-repeat;
    width: 22px;
    height: 22px;
    float: left;
    margin: 2px 6px 0 0;
}

.resetBtn {
    width: 128px;
    height: 56px;
    border-radius: 8px;
    background-color: #f7941d;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    border: none;
    cursor: pointer;
}

.capacityKW {
    display: flex;
    align-items: center;
    gap: 16px;
}

.capKWLabel {
    font-size: 20px;
    color: #fff;
}
.capacityErrorMessageClass{
    font-size: 15px;
    color: red;
    margin-left: 430px;
    margin-top: -19px;
}

.inpKW {
    width: 80px;
    height: 50px;
    text-align: center;
    color: #fff;
    font-size: 20px;
    background-color: #184d93;
    border: 2px solid #fff;
    border-radius: 8px;
    outline: none;
}

.imgsCont {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 24px;
}

.imgCont {
    width: 100%;
    border-radius: 8px;
    background-color: #fff;
    padding: 24px;
    display: flex;
    gap: 24px;
    align-items: flex-start;
    border-left: 8px solid #f7941d;
    max-width: 438px;

}

.img {
    max-width: 150px;
}

/* .imgPadding {
    border-radius: 12px;
    border: 1px solid #999;
    background-color: #fff;
    padding: 20px;
    display: grid;
    place-items: center;
    width: fit-content;
} */

.imgContent {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
    height: 100%;
}

.specSheet {
    color: #006aa9;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
}

.headingImg {
    font-size: 24px;
    font-weight: 600;
    color: #000;
}

.valImg {
    font-size: 16px;
    font-weight: bold;
    color: #404040;
}

.footer {
    position: fixed;
    bottom: 0px;
    min-height: 100px;
    width: 100%;
    background-color: #184d93;
}

.footerFlex {
    margin: auto;
    width: 90%;
    display: grid;
    grid-template-columns: auto 35%;
    grid-gap: 40px;
    border-top: 1px solid #016ead;
}

.stepsFlex {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
}

.steps {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
}

.footerNextBtn,
.footerBackBtn {
    width: 128px;
    height: 56px;
    border-radius: 8px;
    background-color: #f7941d;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    border: none;
}

.footerBackBtn {
    background-color: #016ead;
}

.footerLine {
    font-size: 16px;
    color: #ccc;
    line-height: 1.38;
    padding-top: 12px;
}
.info-container{
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

}
.radio-container{
    height: 100%;
    display: flex;
    flex-direction: row;
    width: 20%;
    margin: 8% 0 0 0 !important;
    padding: 0 !important;
}
.inverter-container{
    height: 100%;
    display: flex;
}
div >>>.el-input__wrapper{
    height: 2rem !important;
    border: 1.5px solid white;
    width: 100px;
}
div >>>.el-input__wrapper .el-input__inner{
    height: 2rem !important;
    font-size: 1rem  !important;
    font-weight: bold;
}
</style>