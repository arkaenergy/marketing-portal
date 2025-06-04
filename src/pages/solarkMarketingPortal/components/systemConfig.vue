<template>
    <div class="container">
        <div class="maxWidthContainer">
            <div class="flexBtn">
                <p class="heading">Our Recommendation</p>
                <!-- <el-button class="dwnldBtn">Download System Report</el-button> -->
            </div>
            <div class="gridContainer">
                <div class="boxTwo">
                    <div class="boxOne">
                        <div class="iIconCont">
                            <span class="boxHead">Energy Backup</span>
                            <!-- <img src="../assets/img/info-circle-fill.svg" class="iIcon" /> -->
                            <p class="boxValue">{{ finalOutput.energy_backup }}</p>
                        </div>
                        
                        <div class="iIconCont">
                            <span class="boxHead">Annual Energy Consumption</span>
                            <!-- <img src="../assets/img/info-circle-fill.svg" class="iIcon" /> -->
                            <p class="boxValue">{{ convertedWithComaskWh(Number(AnnualData).toFixed(0)) }} kWh</p>
                        </div>

                        <div class="iIconCont">
                            <span class="boxHead">Annual Generation</span>
                            <!-- <img src="../assets/img/info-circle-fill.svg" class="iIcon" /> -->
                            <p class="boxValue">{{convertedWithComaskWh(Number(finalOutput.annual_generation).toFixed(0))}} kWh</p>
                        </div>

                        <div class="iIconCont">
                            <span class="boxHead"> Recommended Solar Array Size</span>
                            <!-- <img src="../assets/img/info-circle-fill.svg" class="iIcon" /> -->
                            <p class="boxValue">{{Number(finalOutput.pv_size).toFixed(2)}} kW</p>
                        </div>

                        <div class="iIconCont">
                            <span class="boxHead">Additional Savings</span>
                            <!-- <img src="../assets/img/info-circle-fill.svg" class="iIcon" /> -->
                            <p class="boxValue">${{formatNumberWithCommas((Number(finalOutput.savings).toFixed(0)))}} per year</p>
                        </div>
                    </div>
                    <div class="commonBoxTwo">
                        <div class="flexBtn">
                            <p class="boxHeading">Energy Stick Diagram</p>
                            <!-- <img src="../assets/img/info.png" class="iIconStick" /> -->
                        </div>
                        <div class="imgContainer">
                            <img :src="showDiagram()" class="diagram" />
                        </div>
                    </div>
                </div>
                <div class="boxTwo boxTwoInner">
                    <div class="invBattBoxes">
                        <img src="../assets/img/Sol-Ark-8K.png" class="img" />
                        <div class="imgContent">
                            <div class="inverter-container">
                                    <!-- <div class="radio-container">
                                            <el-radio-group v-model="radio1" class="ml-4" text-color="orange">
                                                <el-radio label="" size="large"></el-radio>
                                                <el-radio label=" " size="large"></el-radio>
                                            </el-radio-group>
                                        </div> -->
                                <div class="info-container">
                                    <div>
                                <p class="headingImg">Inverter</p>
                                <p class="valImg" v-for="(data,index) in computedFinalInverters.slice(0,1)" :key="index">
                                    <!-- Recommended Inverter:<br/>   -->
                                    {{ data['manufacturer'] }} {{ data['make'] }} 
                                    <!-- <span class="quantity"> &nbsp; x{{data['quantity']}}</span> -->
                                </p>
                                <p class="valImg" v-if="!Object.keys(computedFinalInverters).length">
                                    Sol-Ark 8K (8K-2P-N)
                                </p>
                                <p v-if="finalOutput.count_of_inverter > 1">Quantity: {{ finalOutput.count_of_inverter }}</p>
                                <p class="specSheet" @click="downloadFirstInverter">View Spec Sheet</p>
                            </div>
                            <div  v-if="computedFinalInverters.length>=2">
                                        <p>Future Proof with:</p>
                                        <p class="valImg" v-for="(data,index) in computedFinalInverters.slice(1,2)" :key="index">
                                            <!-- Sol-Ark (15K-2P) -->
                                            {{ data['manufacturer'] }} {{ data['make'] }} 
                                        </p>
                                        <p class="specSheet" @click="downloadUpgradedInverter">View Spec Sheet</p>
                                       
                                    </div>
                                </div>
                            </div>
                            
                            <!-- <div v-if="computedFinalInverters.length>=2">
                                <p class="valImg" v-for="(data,index) in computedFinalInverters.slice(1,2)" :key="index">
                                    Future proof with:<br/>  {{ data['manufacturer'] }} {{ data['make'] }} 
                                   
                                    </p>
                                <p class="specSheet" @click="downloadUpgradedInverter">View Spec Sheet</p>
                            </div> -->
                        </div>
                    </div>
                    <div class="invBattBoxes">
                        <!-- <img src="../assets/img/Untitled.png" class="img" /> -->
                        <div class="imgContent">
                            <div>
                                <p class="headingImg">Energy Storage</p>
                                <p class="batteryHead">Capacity - {{ Number(finalOutput.total_size_battery).toFixed(2) }} kWh</p>
                                <p class="battFeatures">Energy Storage Features</p>
                                <!-- {{ computedVendorRecommendation }} -->
                                <el-checkbox-group v-model="batteryFeatures"  class="gapCheckBox">
                                    <el-checkbox  label="Outdoor" style="display: relative;">Outdoor 
                                        <el-tooltip
                                        class="box-item"    
                                        effect="dark"
                                        content="The battery is in an outdoor setting"
                                        placement="top"
                                        >
                                        <span>
                                            <img class="tool-tip-icon-i-outdoor"   src="/assets/tooltip.svg" alt="tooltip">
                                            <img class="tool-tip-icon-circle-outdoor"   src="/assets/circletooltip.svg" alt="tooltip">
                                        </span>
                                        </el-tooltip> 
                                    </el-checkbox>
                                    <el-checkbox label="Indoor" >Indoor
                                        <el-tooltip
                                        class="box-item"    
                                        effect="dark"
                                        content="The battery is in an indoor setting"
                                        placement="top"
                                        >
                                        <span>
                                            <img class="tool-tip-icon-i-indoor"   src="/assets/tooltip.svg" alt="tooltip">
                                            <img class="tool-tip-icon-circle-indoor"   src="/assets/circletooltip.svg" alt="tooltip">
                                        </span>
                                        </el-tooltip> 
                                    </el-checkbox>
                                    <el-checkbox label="Heated" >Heated
                                        <el-tooltip
                                        class="box-item"    
                                        effect="dark"
                                        content="Recommended for operating environments below 40F / 5C"
                                        placement="top"
                                        >
                                        <span>
                                            <img class="tool-tip-icon-i-heated"   src="/assets/tooltip.svg" alt="tooltip">
                                            <img class="tool-tip-icon-circle-heated"   src="/assets/circletooltip.svg" alt="tooltip">
                                        </span>
                                        </el-tooltip> 
                                    </el-checkbox>
                                    <el-checkbox label="California Standard" >California Standard
                                        <el-tooltip
                                        class="box-item"    
                                        effect="dark"
                                        content="Requires UL9540 Ed. 2 2020"
                                        placement="top"
                                        >
                                        <span>
                                            <img class="tool-tip-icon-i-california"   src="/assets/tooltip.svg" alt="tooltip">
                                            <img class="tool-tip-icon-circle-california"   src="/assets/circletooltip.svg" alt="tooltip">
                                        </span>
                                        </el-tooltip> 
                                    </el-checkbox>
                                </el-checkbox-group>
                                <p class="batteryHead">Battery Recommendations</p>
                                <ul class="gridContLast">
                                    <li @click="fetchSelectedBatteries('Endure Energy')" 
                                        v-if="computedVendorRecommendation.includes('Endurenergy')" class="options">
                                        Endurenergy
                                    </li>
                                    <li @click="fetchSelectedBatteries('Home Grid')"
                                        v-if="computedVendorRecommendation.includes('Homegrid')" class="options">
                                        Homegrid
                                    </li>
                                    <li @click="fetchSelectedBatteries('Pytes Battery')" 
                                        v-if="computedVendorRecommendation.includes('Pytes')"
                                        class="options">
                                        Pytes
                                    </li>
                                    <li @click="fetchSelectedBatteries('Storz Power')" 
                                        v-if="computedVendorRecommendation.includes('Storz Power')"
                                        class="options">
                                        Storz Power
                                    </li>
                                </ul>
                                <!-- <p class="valImg" v-for="(data,index) in computedFinalBattery" :key="index">
                                   {{ index+1 }} ) {{ data['totalCapacity'] }} kWh {{ data['model'] }} <span class="quantity"> &nbsp; x{{data['quantity']}}</span>
                                </p>
                                <p class="valImg" v-if="!Object.keys(computedFinalBattery).length">
                                    20kWh Endur Energy ESP-BU20 
                                </p> -->
                            </div>
                            <!-- <p class="specSheet" @click="downloadBattery">View Spec Sheet</p> -->
                        </div>
                    </div>
                    <div class="invBattBoxes" v-if="this.SolarInstalled==='Yes'">
                        <!-- <img src="../assets/img/Untitled.png" class="img" /> -->
                        <div class="imgContent" >
                            <div >
                                <p class="headingImg">Solar Rapid Shutdown</p>
                                <p class="batteryHead" >
                                    Sol-Ark 0900-80V
                                </p>
                                <p class="batteryHead" style="color: blue;cursor: pointer;" @click="DownloadPdf">View Spec Sheet</p>
                                <p class="battFeatures">Battery Recommendations</p>
                                <ul class="gridContLast">
                                    <li class="options">
                                        Module Level Monitoring
                                    </li>
                                    <li class="options">
                                        Shade management
                                    </li>
                                    <li class="options">
                                        Rapid shutdown Compliance
                                    </li>
                                    <li class="options">
                                        One Per Solar Panel
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            <!-- <div class="gridContainerTwo">
                <div class="commonBoxTwo">
                    <p class="boxHeading">Energy Stick Diagram</p>
                    <div class="imgContainer">
                        <img src="../assets/img/Mask Group 99.png" class="diagram" />
                    </div>
                </div>
                <div class="commonBox">
                    <p class="boxHeading">Critical Energy Needs​</p>
                    <div class="chkBoxCont">
                        <p class="paragraph">In the event of a grid outage, which of the following would you want to ​keep
                            running? Select in the order of priority​.</p>
                        <el-checkbox-group v-model="checkList" class="gapCheckBox">
                            <el-checkbox label="Refrigerator" />
                            <el-checkbox label="Freezer" />
                            <el-checkbox label="Lights" />
                            <el-checkbox label="Internet" />
                            <el-checkbox label="Pool pump" />
                            <el-checkbox label="Heating" />
                            <el-checkbox label="Cooling" />
                        </el-checkbox-group>
                        <p class="underlineTxt">View/Edit your critical
                            Equipments</p>
                        <p class="equipment">Do you have any critical medical equipment at home?</p>
                        <el-checkbox-group v-model="isMedicalEquipment" class="gapCheckBox">
                            <el-checkbox label="Yes" />
                            <el-checkbox label="No" checked />
                        </el-checkbox-group>
                        <el-checkbox-group v-model="medicalEquipmentSize" class="gapCheckBox" v-if="isMedicalEquipment == 'Yes'">
                            <el-checkbox label="Small" checked/>
                            <el-checkbox label="Large" />
                        </el-checkbox-group>
                        <div class="addMedEquipCont" v-if="medicalEquipmentSize == 'Large'">
                            <div class="inputCont">
                                <p class="label">Name</p>
                                <input type="text" class="inputTag" />
                            </div>
                            <div class="inputCont">
                                <p class="label">Capacity</p>
                                <input type="text" class="inputTag" />
                            </div>
                            <div class="inputCont">
                                <p class="label">No. of Hours</p>
                                <input type="text" class="inputTag" />
                            </div>
                        </div>
                    </div>
                </div>
            </div> -->
        </div>
        <div class="footer">
            <div class="footerFlex">
                <el-button class="footerBackBtn" @click="backButton()">Back</el-button>
                <p class="footerLine">> Disclaimer : This is a preliminary estimate based on input provided through this form.
                    Please consult with Sol-ark or a Sol-ark affiliated installer for a final recommendation.</p>
                    <!-- <ul class="footerUl">
                        <li class="footerLi">If load 50% larger than invert => Load management strongly recommended</li>
                        <li class="footerLi">If load is > 50% larger than inverter => Load management or multiple inverters strongly recommended. Please consult design expert before proceeding with project</li>
                    </ul> -->
            </div>
        </div>
    </div>
</template>

<script>
    import API from '@/services/api';
    import { ref } from 'vue'
    import { Search, InfoFilled } from '@element-plus/icons-vue'

    import NoACPVNoDCPV from "../assets/img/NoACPVNoDCPV.svg"
    import NoACPVYesDCPV from "../assets/img/NoACPVYesDCPV.svg"
    import YesACPVNoDCPV from "../assets/img/YesACPVNoDCPV.svg"
    import YesACPVYesDCPV from "../assets/img/YesACPVYesDCPV.svg"


    import NoACNoDC5k8k12k from "../assets/img/NoACNoDC5k8k12k.svg"
    import NoACNoDC15k from "../assets/img/NoACNoDC15k.svg"
    import YesACNoDC5k8k12k from "../assets/img/YesACNoDC5k8k12k.svg"
    import YesACNoDC15k from "../assets/img/YesACNoDC15k.svg"
    import NoACYesDC5k8k12k from "../assets/img/NoACYesDC5k8k12k.svg"
    import NoACYesDC15k from "../assets/img/NoACYesDC15k.svg"
    import YESACYesDC5k8k12k from "../assets/img/YESACYesDC5k8k12k.svg"
    import YESACYesDC15k from "../assets/img/YESACYesDC15k.svg"

    import {useToast} from 'vue-toast-notification';
    import 'vue-toast-notification/dist/theme-sugar.css';
    const $toast = useToast();

export default {
    data() {
        return {
            radio1: ref(''),
            checkList: [],
            isMedicalEquipment: [],
            medicalEquipmentSize: [],
            NoACPVNoDCPV,
            NoACPVYesDCPV,
            YesACPVNoDCPV,
            YesACPVYesDCPV,
            finalOutput:{},
            AnnualData:'',
           SolarInstalled:'',
            batteryFeatures: [],
            selectedBatteryList: [],
        }
    },

    mounted() {
        this.showDiagram();
        this.finalOutput = JSON.parse(localStorage.getItem('final-output'));
        this.showErrorMessages();
        this.SolarInstalled=JSON.parse(localStorage.getItem("jsonToSendForCalculation"))?.additional_info_for_frontend?.energyConsumptionInfo?.wantSolarInstalled
        this.AnnualData=(JSON.parse(localStorage.getItem("jsonToSendForCalculation"))?.additional_info_for_frontend?.homeInfo?.avgMontlyEngConsump)*12;
    },

    computed: {
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
        computedVendorRecommendation(){
            let outdoorArray = ['Homegrid'];
            let indoorArray = ['Homegrid','Endurenergy','Pytes','Storz Power'];
            let heatedArray = ['Homegrid'];
            let ULArray = ['Homegrid','Pytes'];
            let intersection = ['Homegrid','Endurenergy','Pytes','Storz Power'];
            if(this.batteryFeatures.includes('Outdoor')){
                intersection = intersection.filter(item => outdoorArray.includes(item))
            }
            if(this.batteryFeatures.includes('Indoor')){
                intersection = intersection.filter(item => indoorArray.includes(item))
            }
            if(this.batteryFeatures.includes('Heated')){
                intersection = intersection.filter(item => heatedArray.includes(item))
            }
            if(this.batteryFeatures.includes('California Standard')){
                intersection = intersection.filter(item => ULArray.includes(item))
            }
            return intersection ;
        },

        computedFinalInverters(){
        let finalArray = [];
        if(Object.keys(this.finalOutput).length){
           let myData = this.finalOutput['suggested_inverter_details'];
           let size = 0;
           let count = 0;
           for(let i=0;i<myData.length;i++){
            if(!count){
                size = myData[i]['Size'];
                finalArray.push({
                    'manufacturer': myData[i]['fields']['Manufacturer'],
                    'size': myData[i]['fields']['Size'],
                    'make': myData[i]['fields']['Make'],
                    'quantity': 0,
                    'link': myData[i]['fields']['Source_link'],
                });
                count++;
                finalArray[finalArray.length-1].quantity = count;
            } else {
                if(size == myData[i]['fields']['Size']){
                    count++;
                    finalArray[finalArray.length-1].quantity = count;
                } else {
                    finalArray[finalArray.length-1].quantity = count;
                    size = myData[i]['fields']['Size'];
                    count = 0;
                    finalArray.push({
                        'manufacturer': myData[i]['fields']['Manufacturer'],
                        'size': myData[i]['fields']['Size'],
                        'make': myData[i]['fields']['Make'],
                        'quantity': 0,
                        'link': myData[i]['fields']['Source_link'],
                    });
                    count++;
                    finalArray[finalArray.length-1].quantity = count;
                }
            }
           }
        }
        console.log(finalArray);
        return finalArray;
        },
    },

    methods: {
        formatNumberWithCommas(value, options) {
            
            if (typeof value === 'string') {
                value = value.replace(/,/g, '')
            }
            if (!options) {
                options = {};
            }
            return parseFloat(value).toLocaleString("en-US", options);
        },  
        DownloadPdf() {
            const pdfUrl = "https://www.sol-ark.com/wp-content/uploads/2023/03/O900-80V-SPECSHEET-1.pdf";
            window.open(pdfUrl, "_blank");
            // const link = document.createElement("a");
            // link.download = "O900-80V-SPECSHEET-1.pdf";
            // link.href = pdfUrl;
            // link.click();
         } ,
        convertedWithComaskWh(value){
            if (typeof value === 'string'){
                return parseFloat(value.replace(/,/g, '')).toLocaleString("en-US")
            }
            else{
                return parseFloat(value).toLocaleString("en-US")
            }
        },
        displayModifiedWarningToast(msg){
            $toast.open({
            message: msg,
            type: 'info',
            duration: 1000 * 10,
            dismissible: true,
            position: 'top',
            // all of other options may go here
        });
        },
        showErrorMessages(){
            let powerBackupGoal = JSON.parse(localStorage.getItem("jsonToSendForCalculation"))?.additional_info_for_frontend?.energyConsumptionInfo?.powerBackupGoal;
            let inverterSize = JSON.parse(localStorage.getItem("final-output"))?.suggested_inverter_details[0]?.Size;
            let totalOperatingPowerCritical =  JSON.parse(localStorage.getItem("final-output"))?.total_operating_power_critical;
            if(inverterSize==15 && powerBackupGoal != 'Short Duration/Least Budget'){
                if(totalOperatingPowerCritical<=22.5){ // 22.5 because 50% of 15 is 7.5 and 15+7.5 is 22.5 so its within 50% of displayed power
                    this.displayModifiedWarningToast('Load management is recommended. Please consult with a design expert before proceeding with the project!')
                }
                else if(totalOperatingPowerCritical>22.5){
                    this.displayModifiedWarningToast('Multiple inverters will be needed or you can consider managing your loads. Please consult with a design expert before proceeding with the project.')
                }
            }
            else if(powerBackupGoal == 'Short Duration/Least Budget'){
                if(totalOperatingPowerCritical<=7.5){ // 22.5 because 50% of 15 is 7.5 and 15+7.5 is 22.5 so its within 50% of displayed power
                    this.displayModifiedWarningToast('Load management is recommended. Please consult with a design expert before proceeding with the project!')

                }
                else if(totalOperatingPowerCritical>7.5){
                    this.displayModifiedWarningToast('Multiple inverters will be needed or you can consider managing your loads. Please consult with a design expert before proceeding with the project.')

                }
            }
        },
        showDiagram() {
            let data = JSON.parse(localStorage.getItem("jsonToSendForCalculation")).additional_info_for_frontend.energyConsumptionInfo;
            let inverterSize = JSON.parse(localStorage.getItem("final-output"))?.suggested_inverter_details[0]?.['fields']?.Size;
            let haveSolarInstalled = data.haveSolarInstalled;
            let wantSolarInstalled = data.wantSolarInstalled;

            console.log("inverter size, have solar installed, want to install solar",inverterSize,haveSolarInstalled, wantSolarInstalled);

            switch(true) {
                case inverterSize<15 && haveSolarInstalled=='No' && wantSolarInstalled=='No':
                    return NoACNoDC5k8k12k;
                    break;
                case inverterSize<15 && haveSolarInstalled=='No' && wantSolarInstalled=='Yes':
                    return NoACYesDC5k8k12k;
                    break;    
                case inverterSize<15 && haveSolarInstalled=='Yes' && wantSolarInstalled=='No':
                    return YesACNoDC5k8k12k;
                    break;
                case inverterSize<15 && haveSolarInstalled=='Yes' && wantSolarInstalled=='Yes':
                    return YESACYesDC5k8k12k;
                    break;
                case inverterSize==15 && haveSolarInstalled=='No' && wantSolarInstalled=='No':
                    return NoACNoDC15k;
                    break;
                case inverterSize==15 && haveSolarInstalled=='No' && wantSolarInstalled=='Yes':
                    return NoACYesDC15k;
                    break;
                case inverterSize==15 && haveSolarInstalled=='Yes' && wantSolarInstalled=='No':
                    return YesACNoDC15k;
                    break;
                case inverterSize==15 && haveSolarInstalled=='Yes' && wantSolarInstalled=='Yes':
                    return YESACYesDC15k;
                    
            }
        },
        backButton() {
            this.$router.push({ name: 'solarkMarketingPortal', params: { steps: true } });
        },
        getAllBatteryUrls(){
            let urls=[];
            for( let item of this.selectedBatteryList ){
                if(item['link']){
                        urls.push(item['link'])
                    }
            }
            return urls;
        },
        getAllInverterUrls(){
            let urls=[];
            for( let item of this.computedFinalInverters ){
                    if(item['link']){
                        urls.push(item['link'])
                    }
            }
            return urls;
        },
        getFirstInverterUrls(){
            let urls = [];
            urls.push(this.computedFinalInverters[0]['link']);
            return urls;
        },
        getUpgradedInverterUrls(){
            let urls = [];
            // upgraded index will always be index- 1
            if(this.computedFinalInverters.length>=2)
            urls.push(this.computedFinalInverters[1]['link']);
            return urls;
        },
        downloadBattery(){
            let urls = this.getAllBatteryUrls();
            this.downloadPDFOfgivenURLS(urls);

            // for (let fileUrl of urls) {
            //     let splitArray = fileUrl.split('?')[0].split('/')
            //     let fileName = splitArray[splitArray.length - 1]
            //     saveAs(fileUrl, fileName)
            // }
        },
        downloadFirstInverter(){
            let urls = this.getFirstInverterUrls();
            this.downloadPDFOfgivenURLS(urls);

            // for (let fileUrl of urls) {
            //     let splitArray = fileUrl.split('?')[0].split('/')
            //     let fileName = splitArray[splitArray.length - 1]
            //     saveAs(fileUrl, fileName)
            // }
        },
        downloadUpgradedInverter(){
            let urls = this.getUpgradedInverterUrls();
            this.downloadPDFOfgivenURLS(urls);

            // for (let fileUrl of urls) {
            //     let splitArray = fileUrl.split('?')[0].split('/')
            //     let fileName = splitArray[splitArray.length - 1]
            //     saveAs(fileUrl, fileName)
            // }
        },
        downloadInverter(){
            let urls = this.getAllInverterUrls();
            this.downloadPDFOfgivenURLS(urls);
            // for (let fileUrl of urls) {
            //     let splitArray = fileUrl.split('?')[0].split('/')
            //     let fileName = splitArray[splitArray.length - 1]
            //     saveAs(fileUrl, fileName)
            // }
        },
        downloadPDFOfgivenURLS(urls){
            for (let fileUrl of urls) {
                let splitArray = fileUrl.split('?')[0].split('/')
                let fileName = splitArray[splitArray.length - 1]
                saveAs(fileUrl, fileName)
            }
        },
        async fetchSelectedBatteries(selectedBatteryName){
          let response =  await API.SOLARK.FETCH_SELECTED_BATTERIES_LIST(selectedBatteryName);
          this.selectedBatteryList = response.data;
          console.log("selected batteries list",this.selectedBatteryList);
          this.downloadBattery();
        }
    },

    watch: {
        isMedicalEquipment(newValue) {
            if (newValue.length > 1) {
                this.isMedicalEquipment = [newValue[newValue.length - 1]]
            }
        },

        medicalEquipmentSize(newValue) {
            if (newValue.length > 1) {
                this.medicalEquipmentSize = [newValue[newValue.length - 1]]
            }
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
a {
    font-family: 'Poppins';
}

.container {
    width: 100%;
    /* height: 100%; */
    min-height: calc(100vh - 96px);
    background-color: #184d93;
}

.maxWidthContainer {
    width: 95%;
    margin: 0px auto;
    padding-bottom: 124px;
}

.flexBtn {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
}

.heading {
    font-size: 42px;
    font-weight: bold;
    color: #f7941d;
    padding-top: 24px;
    margin-bottom: 24px;
}

.dwnldBtn {
    width: 300px;
    height: 68px;
    border-radius: 12px;
    background-color: #f7941d;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    border: none;
}

.gridContainer {
    display: grid;
    grid-template-columns: 70% auto;
    gap: 24px;
    align-items: flex-start;
}

.boxHeading {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8px;
}

.boxOne {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
}

.iIconCont {
    padding: 16px;
    background-color: #fff;
    border-radius: 8px;
}

.boxHead {
    font-size: 16px;
    height:60px;
    font-weight: 600;
    color: #777;
    display: inline-block;
}

.iIcon {
    margin-left: 6px;
    margin-bottom: -2px;
    cursor: pointer;
}

.iIconStick {
    width: 20px;
    height: 20px;
}

.boxValue {
    font-size: 24px;
    font-weight: bold;
    color: #000;
    height: 60px;
    /* line-height: 1.2;
    margin-top: 8px; */
}

.boxTwo {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 24px;
}
.boxTwoInner{
    max-height: 700px;
    /* margin-right: 10px; */
    /* height: 100% !important; */
    overflow: scroll;
    overflow-x: hidden;
}
::-webkit-scrollbar {
  width: 8px;
  background-color: #f5f5f5;
}
/* Customize scrollbar thumb */
::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 4px;
}
/* Customize scrollbar on hover */
::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

.invBattBoxes {
    display: flex;
    margin-right: 10px;
    justify-content: space-evenly;
    gap: 20px;
    background-color: #fff;
    border-radius: 12px;
    padding: 24px;
    border-left: 8px solid #f7941d;
}

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

.gridContainerTwo {
    display: grid;
    grid-template-columns: 60% 38%;
    gap: 16px;
    margin-top: 20px;
    align-items: flex-start;
}

.commonBoxTwo {
    width: 100%;
    height: 500px;
}

.imgContainer {
    padding: 8px;
    border-radius: 20px;
    background-color: #fff;
}

.diagram {
    width: 100%;
}

.chkBoxCont {
    padding: 16px;
    border-radius: 12px;
    -webkit-backdrop-filter: blur(30px);
    backdrop-filter: blur(30px);
    background-color: #3e73b9;
}

.paragraph,
.equipment {
    font-size: 16px;
    color: #fff;
}

.underlineTxt {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 24px;
    margin-top: 16px;
    color: #fff;
    text-decoration: underline;
    cursor: pointer;
}

.container :deep() .el-checkbox__inner {
    width: 16px;
    height: 16px;
    background-color: #fff;
    border: 1px solid #777;
    border-radius: 4px;
}

.container :deep() .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #f7941d;
}

.container :deep() .el-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    row-gap: 8px;
    margin-bottom: 16px;
}

.container :deep() .el-checkbox__inner::after {
    border: 3px solid var(--el-checkbox-checked-icon-color);
    border-left: 0;
    border-top: 0;
    height: 7px;
    left: 4px;
    top: 1px;
    width: 2px;
}

.container :deep() .el-checkbox__label {
    font-size: 16px;
    color: #222;
    padding-left: 8px;
}

.addMedEquipCont {
    display: grid;
    grid-template-columns: 1.5fr 1.2fr 1fr;
    grid-gap: 16px;
    margin-top: 16px;
}

.label {
    font-size: 14px;
    color: #fff;
    margin-bottom: 4px;
}

.inputTag {
    width: 100%;
    height: 40px;
    border-radius: 4px;
    border: 1px solid #fff;
    background-color: #3e73b9;
    padding: 16px;
    font-size: 16px;
    color: #fff;
}

.batteryHead {
    font-size: 14px;
    color: #222;
    font-weight: bold;
    margin-bottom: 16px;
    margin-top: 6px;
}

.battFeatures {
    font-size: 16px;
    color: #222;
    font-weight: bold;
    margin-bottom: 8px;
}

.gridContLast {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 16px;
    row-gap: 8px;
    list-style-position: inside;
    margin-bottom: 16px;
}

.options {
    font-size: 16px;
    color: #222;
    cursor: pointer;
}
.options:hover{
    text-decoration: underline;
}

.footer {
    position: fixed;
    bottom: 0px;
    min-height: 100px;
    width: 100%;
    border-top: 1px solid #016ead;
    background-color: #184d93;
    display: grid;
    place-items: center;
}

.footerFlex {
    margin: auto;
    width: 95%;
    display: flex;
    align-items: center;
    gap: 24px;
}

.footerBackBtn {
    width: 128px;
    height: 56px;
    border-radius: 8px;
    background-color: #016ead;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    border: none;
}

.footerLine {
    font-size: 16px;
    color: #ccc;
    line-height: 1.38;
}

.footerUl {
    max-width: 420px;
}

.footerLi {
    font-size: 12px;
    color: #fff;
    margin-bottom: 4px;
    line-height: 1.5;
}

.img {
    max-width: 150px;
}
.tool-tip-icon-circle-outdoor{
    width: 15px;
    position: absolute;
    left: 89px;
    top: 8.5px
}
.tool-tip-icon-i-outdoor {
    width: 3px;
    position: absolute;
    top: 11.5px;
    left: 95px;
}
.tool-tip-icon-circle-indoor{
    width: 15px;
    position: absolute;
    left: 76px;
    top: 8.5px
}
.tool-tip-icon-i-indoor {
    width: 3px;
    position: absolute;
    top: 11.5px;
    left: 82px;
}
.tool-tip-icon-circle-heated{
    width: 15px;
    position: absolute;
    left: 82px;
    top: 8.5px
}
.tool-tip-icon-i-heated {
    width: 3px;
    position: absolute;
    top: 11.5px;
    left: 88px;
}
.tool-tip-icon-circle-california{
    width: 15px;
    position: absolute;
    left: 168px;
    top: 8.5px
}
.tool-tip-icon-i-california {
    width: 3px;
    position: absolute;
    top: 11.5px;
    left: 174px;
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
    padding-right: 0;
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