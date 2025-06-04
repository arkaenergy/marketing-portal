<template>
    <div class="parentContainer reportLoaded">
        <div class="childContainer" id="childContainerId">
            <div class="commonPageClass">
                <img src="../solarkMarketingPortal/assets/img/Sol-Ark-Logo.png" alt="" />
                <p class="heading">Our Recommendations</p>
                <div class="prntBoxOne">
                    <div class="commonCard boxOne">
                        <p class="cardHeading">Solar Capacity</p>
                        <div class="flexRow">
                            <img src="./assets/solarCapacity.svg" alt="" />
                            <div class="flexColumn">
                                <p class="smallHeading">{{ solarCapacity }} kWp</p>
                                <!-- <p class="normalFont">Quantity: <span class="smallHeading">{{ inverterQuantity }}</span></p> -->
                                <p class="normalFont">Annual Production:<br />
                                    <span class="smallHeading">{{ formatNumberInternational(annualProduction) }} kWh</span>
                                </p>
                                <p class="normalFont">Annual Savings:<br />
                                    <span class="smallHeading">${{ formatNumberInternational(annualSavings) }}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="commonCard boxTwo">
                        <p class="cardHeading">Solar Rapid Shutdown</p>
                        <div class="flexRow">
                            <img src="./assets/rapidShutdown.svg" alt="" />
                            <div class="flexColumn">
                                <p class="normalFont">Sol-Ark 0900-80V</p>
                            </div>
                        </div>
                    </div>
                    <div class="commonCard boxThree">
                        <p class="cardHeading">Energy Storage</p>
                        <div class="flexColumn">
                            <p class="normalFont">Capacity - {{ batteryCapacity }} kWh</p>
                            <p class="smallHeading">Energy Storage Features<br />
                                <span v-for="(item,index) in batteryFeatures" :key="index"  class="normalFont">{{ item +' ' }}</span>
                            </p>
                            <p class="smallHeading">Vendor Recommendations</p>
                            <ul class="ulList">
                                <li class="normalFont"  v-for="(item,index) in recommendedPartners" :key="index">{{ item }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="prntBoxTwo">
                    <div class="commonCard boxOne">
                        <p class="cardHeading">Inverter</p>
                        <div class="flexRow">
                            <img src="./assets/inverter.svg" alt="" />
                            <div class="flexColumn">
                                <p class="smallHeading">{{ inverterProductName }}</p>
                                <p class="normalFont">Quantity: <span class="smallHeading">{{ inverterQuantity }}</span></p>
                            </div>
                        </div>
                    </div>
                    <div class="commonCard">
                        <p class="cardHeading">Load Control</p>
                        <div class="flexRow">
                            <img src="./assets/loadControl.svg" alt="" />
                            <div>
                                <p class="normalFont">${{ formatNumberInternational(additionalSavings)}} per year</p>
                                <div class="flexNoGap">
                                    <div class="noGapBoxOne">
                                        <p class="smallHeading">Without Sol-Ark</p>
                                        <div class="flexSmallRow">
                                            <p class="smallFont">Inverter <br />Capacity<br />
                                                <span class="cardHeading">{{ formatNumberInternational(withoutSolIC) }} kW</span>
                                            </p>
                                            <p class="smallFont">Battery<br /> Capacity<br />
                                                <span class="cardHeading">{{ formatNumberInternational(withoutSolBC) }} kWh</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div class="noGapBoxTwo">
                                        <p class="smallHeading">With Sol-Ark</p>
                                        <div class="flexSmallRow">
                                            <p class="smallFont">Inverter <br />Capacity<br />
                                                <span class="cardHeading">{{ formatNumberInternational(withSolIC) }} kW</span>
                                            </p>
                                            <p class="smallFont">Battery<br /> Capacity<br />
                                                <span class="cardHeading">{{ formatNumberInternational(withSolBC) }} kWh</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p class="smallHeading">System Diagram</p>
                <img :src="showDiagram()" alt="" class="diagram" />
                <div class="gridEqualCont">
                    <div class="impactCard">
                        <div class="imgBackground">
                            <img src="./assets/Union.svg" alt="" class="sysSumIcons" />
                        </div>
                        <p class="smallHeading">Carbon Dioxide <br />Offset<br />
                            <span class="impVal">{{ formatNumberInternational(co2Offset) }}</span><br />
                            <span class="impUnit">metric tons</span>
                        </p>
                    </div>
                    <div class="impactCard">
                        <div class="imgBackground">
                            <img src="./assets/tree.svg" alt="" class="sysSumIcons" />
                        </div>
                        <p class="smallHeading">Equivalent Forests<br /> Saved<br />
                            <span class="impVal">{{ formatNumberInternational(equivalentForestsSaved) }}</span><br />
                            <span class="impUnit">acres/ year</span>
                        </p>
                    </div>
                    <div class="impactCard">
                        <div class="imgBackground">
                            <img src="./assets/coalBurn.svg" alt="" class="sysSumIcons" />
                        </div>
                        <p class="smallHeading">Coal Burn<br /> Avoided<br />
                            <span class="impVal">{{ formatNumberInternational(coalBurnAvoided) }}</span><br />
                            <span class="impUnit">metric tons</span>
                        </p>
                    </div>
                </div>
            </div>


            <div class="commonPageClass" id="commonPageId">
                <img src="../solarkMarketingPortal/assets/img/Sol-Ark-Logo.png" alt="" />
                <p class="heading" id="headingId">My details and requirements</p>
                <p class="headingOR">My Details</p>
                <div class="prntBoxOneOR">
                    <div class="detailsCardOR">
                        <p class="labelOR">Name</p>
                        <p class="valOR">{{ userInfo.name }}</p>
                    </div>
                    <div class="detailsCardOR">
                        <p class="labelOR">Mobile No.</p>
                        <p class="valOR">{{ userInfo.mobileNo }}</p>
                    </div>
                    <div class="detailsCardOR">
                        <p class="labelOR">Email</p>
                        <p class="valOR">{{ userInfo.emailId    }}</p>
                    </div>
                    <div class="detailsCardOR">
                        <p class="labelOR">Address</p>
                        <p class="valOR">{{ userInfo.address?.length> 54?  (userInfo.address.substring(0,54)+'...') : userInfo.address }}</p>
                    </div>
                    <div class="detailsCardOR">
                        <p class="labelOR">Monthly Electricity Bill</p>
                        <p class="valOR">${{formatNumberInternational( avgMonthlyBill) }} per month</p>
                    </div>
                    <div class="detailsCardOR">
                        <p class="labelOR">Estimated Monthly Energy<br />Consumption</p>
                        <p class="valOR">{{formatNumberInternational(estimatedMonthlyConsumption)}}kWh/month</p>
                    </div>
                </div>
                <p class="headingOR">Requirements</p>
                <div class="prntBoxOneOR reqOR">
                    <div class="detailsCardOR">
                        <p class="labelOR">System Configuration</p>
                        <p class="valOR">{{ userLookingFor }}</p>
                    </div>
                    <div class="detailsCardOR">
                        <p class="labelOR">Hours of backup required during an outage</p>
                        <p class="valOR">{{ hoursOfBackup }} hrs</p>
                    </div>
                </div>

                <p class="headingOR">Selected Appliance</p>
                <div class="tableOR">
                    <div class="tableHeaderOR">
                        <p class="tableHeading" id="selectedTableHeadingId">Essential Appliances</p>
                    </div>
                    <div class="tableBodyOR">
                        <div class="blueHeadingsOR">
                            <p class="blueHeading">Appliance Name</p>
                            <p class="blueHeading">Operating Power</p>
                            <p class="blueHeading">Usage Hours</p>
                            <p class="blueHeading">Number of Appliances</p>
                            <p class="blueHeading">Backup</p>
                        </div>
                        <div class="selectedAppliances" id="selectedAppliancesId">
                        <div class="tableValContOR" v-for="(item,index) in smallAppliances" :key="index">
                            <p class="tableValOR">{{ item.name }}</p>
                            <p class="tableValOR alignLeft">{{ formatNumberInternational(item.default_load_kw) }} kWh</p>
                            <p class="tableValOR alignLeft">{{ formatNumberInternational(item.operating_hour) }}</p>
                            <p class="tableValOR alignLeft">{{ item.quantity }}</p>
                            <p class="tableValOR">{{ isThisIdCritical[item.id]? 'Yes' : 'No' }}</p>
                        </div>
                        </div>
                    </div>
                </div>
                <div class="tableOR" id="largeAppliancesTable" v-show="largeAppliances.length>0">
                    <div class="tableHeaderOR">
                        <p class="tableHeading">Large Appliances</p>
                    </div>
                    <div class="tableBodyOR">
                        <div class="blueHeadingsOR">
                            <p class="blueHeading">Appliance Name</p>
                            <p class="blueHeading">Operating Power</p>
                            <p class="blueHeading">Usage Hours</p>
                            <p class="blueHeading">Number of Appliances</p>
                            <p class="blueHeading">Backup</p>
                        </div>
                        <div class="largeAppliances" id="largeAppliancesId">
                            <div class="tableValContOR" v-for="(item,index) in largeAppliances" :key="index">
                                <p class="tableValOR">{{ item.name }}</p>
                                <p class="tableValOR alignLeft">{{ item.default_load_kw }} kWh</p>
                                <p class="tableValOR alignLeft">{{ item.operating_hour }}</p>
                                <p class="tableValOR alignLeft">{{ item.quantity }}</p>
                                <p class="tableValOR">{{ isThisIdCritical[item.id]? 'Yes' : 'No' }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tableOR" id="heavyAppliancesTable" v-show="heavyAppliances.length>0">
                    <div class="tableHeaderOR">
                        <p class="tableHeading" id="selectedTableHeadingId">Heavy Appliances</p>
                    </div>
                    <div class="tableBodyOR">
                        <div class="blueHeadingsOR">
                            <p class="blueHeading">Appliance Name</p>
                            <p class="blueHeading">Operating Power</p>
                            <p class="blueHeading">Usage Hours</p>
                            <p class="blueHeading">Number of Appliances</p>
                            <p class="blueHeading">Backup</p>
                        </div>
                        <div class="heavyAppliances" id="heavyAppliancesId">
                            <div class="tableValContOR" v-for="(item,index) in heavyAppliances" :key="index">
                                <p class="tableValOR">{{ item.name }}</p>
                                <p class="tableValOR alignLeft">{{ item.default_load_kw }} kWh</p>
                                <p class="tableValOR alignLeft">{{ item.operating_hour }}</p>
                                <p class="tableValOR alignLeft">{{ item.quantity }}</p>
                                <p class="tableValOR">{{ isThisIdCritical[item.id]? 'Yes' : 'No' }}</p>
                            </div>                        
                        </div>
                    </div>
                </div>
            </div>

            <!-- <div class="commonPageClass" >
                <img src="../solarkMarketingPortal/assets/img/Sol-Ark-Logo.png" alt="" />
                <p class="heading" >My details and requirements</p>
                <p class="headingOR">Selected Appliance</p>
                <div class="tableOR">
                    <div class="tableHeaderOR">
                        <p class="tableHeading">Heavy Appliances</p>
                    </div>
                    <div class="tableBodyOR">
                        <div class="blueHeadingsOR">
                            <p class="blueHeading">Appliance Name</p>
                            <p class="blueHeading">Operating Power</p>
                            <p class="blueHeading">Usage Hours</p>
                            <p class="blueHeading">Number of Appliances</p>
                            <p class="blueHeading">Backup</p>
                        </div>
                        <div class="tableValContOR">
                            <p class="tableValOR">EV</p>
                            <p class="tableValOR alignLeft">123 kWh</p>
                            <p class="tableValOR alignLeft">24</p>
                            <p class="tableValOR alignLeft">6</p>
                            <p class="tableValOR">Yes</p>
                        </div>
                    </div>
                </div>
            </div> -->
        </div>
    </div>
</template>

<script>
import API from '@/services/api';
import { formatNumberInternational, waitForImagesToLoad } from "@/utils.js";
import NoACNoDC5k8k12k from './assets/NoACNoDC5k8k12k.svg'
import NoACYesDC5k8k12k from './assets/NoACYesDC5k8k12k.svg';
import NoACYesDC15k from './assets/NoACYesDC15k.svg';
import NoACNoDC15k from './assets/NoACNoDC15k.svg';
export default {
    components: {

    },
    async created(){
      await this.fetchReportInfo();
    },
    mounted(){
        let pageNumber = 2;
        function cloneIt(pageHeading = "My details and requirements", firstTableHeading = "My Appliances"){
            let newPage = document.getElementById("commonPageId");
            let newPageClone = newPage.cloneNode(true);
            let childContainer = document.getElementById("childContainerId");
            childContainer.appendChild(newPageClone);
            newPageClone.id = "commonPageId" + pageNumber;
            newPageClone.getElementsByClassName("heading")[0].innerText = pageHeading;
            newPageClone.removeChild(newPageClone.getElementsByClassName("prntBoxOneOR")[0]);
            newPageClone.removeChild(newPageClone.getElementsByClassName("prntBoxOneOR")[0]);
            newPageClone.removeChild(newPageClone.getElementsByClassName("headingOR")[0])
            newPageClone.removeChild(newPageClone.getElementsByClassName("headingOR")[0])
            let childrenToRemove = newPageClone.getElementsByClassName("tableOR");
    
            // Loop through the elements starting from the second one (index 1).
            for (let i = childrenToRemove.length - 1; i > 0; i--) {
                const table = childrenToRemove[i];
                table.remove();
            }
            childrenToRemove = newPageClone.getElementsByClassName("tableOR")[0].getElementsByClassName("tableValContOR");
            for (let i = childrenToRemove.length - 1; i >= 0; i--) {
                const child = childrenToRemove[i];
                child.remove();
            }
            newPageClone.getElementsByClassName("headingOR")[0].innerText = "Selected Appliance";
            let headingOfTable = newPageClone.getElementsByClassName("tableHeading");
            headingOfTable[0].innerText = firstTableHeading;
            pageNumber++;
            return newPageClone;  
        }
        // cloneIt();
        
        function cloneAppliances(){
            let availableHeight = 430;
            let halfed = true;
            let head = document.getElementById("commonPageId");

            let selectedAppliances = head.getElementsByClassName("selectedAppliances")[0];
            let largeAppliances = head.getElementsByClassName("largeAppliances")[0] || 0;
            let heavyAppliances = head.getElementsByClassName("heavyAppliances")[0] || 0;
            let totalSelected = selectedAppliances.childElementCount;
            let totalLarge = largeAppliances.childElementCount;
            let totalHeavy = heavyAppliances.childElementCount;
            let totalSelectedAndLarge = totalSelected + totalLarge;
            // defining i, j and k which references to the number of selected, large and heavy appliances itterated at present
            let i = 0; 
            let j = 0;
            let k = 0;
            while(totalSelected || totalLarge || totalHeavy) {
                if(pageNumber == 2 && totalSelectedAndLarge) {
                    while (
                        selectedAppliances.children[i] &&
                        availableHeight >= selectedAppliances.children[i].clientHeight
                    ) {
                        availableHeight -= selectedAppliances.children[i].clientHeight;
                        i++;
                        totalSelected--;
                        totalSelectedAndLarge--;
                    }
                    if(!totalLarge) {
                        let largeAppliancesTable = document.getElementById("largeAppliancesTable");
                        largeAppliancesTable.remove();
                    } 
                    if(!totalHeavy) {
                        let heavyAppliancesTable = document.getElementById("heavyAppliancesTable");
                        heavyAppliancesTable.remove();
                    }
                    pageNumber++;
                } else if(totalSelectedAndLarge) {
                    if(totalSelected) {
                        availableHeight = 750;
                        var newClone = null;
                        newClone = cloneIt("My details and requirements", "Essential Appliances");
                        let newTableBody = newClone.getElementsByClassName("selectedAppliances")[0];
                        while (
                            selectedAppliances.children[i] &&
                            availableHeight >= selectedAppliances.children[i].clientHeight
                        ) {
                            availableHeight -= selectedAppliances.children[i].clientHeight;
                            newTableBody.appendChild(selectedAppliances.children[i]);
                            totalSelected--;
                            totalSelectedAndLarge--;
                        }
                    } else {
                        if(availableHeight > 134) {
                            halfed = false;
                            if(newClone) {
                                // let heavyAppliancesTable = document.getElementById("heavyAppliancesTable");
                                let largeAppliancesTable = document.getElementById("largeAppliancesTable");
                                // newClone.appendChild(heavyAppliancesTable);
                                newClone.appendChild(largeAppliancesTable);
                                availableHeight-=100;
                            } else {
                                availableHeight-=100;
                            }
                            while (
                                largeAppliances.children[j] &&
                                availableHeight >= largeAppliances.children[j].clientHeight
                            ) {
                                availableHeight -= largeAppliances.children[j].clientHeight;
                                j++;
                                totalLarge--;
                                totalSelectedAndLarge--;
                            }
                        } else {
                            if(halfed) {
                                availableHeight = 750;
                                var newClone = cloneIt("My details and requirements", "Large Appliances");
                                const duplicatedTable = newClone.getElementsByClassName('tableOR');

                                if (duplicatedTable.length > 0) {
                                    const firstElement = duplicatedTable[0];
                                    const parentElement = firstElement.parentNode;
                                    parentElement.removeChild(firstElement);
                                }
                                // let heavyAppliancesTable = document.getElementById("heavyAppliancesTable");
                                let largeAppliancesTable = document.getElementById("largeAppliancesTable");
                                newClone.appendChild(largeAppliancesTable);
                                while (
                                    largeAppliances.children[j] &&
                                    availableHeight >= largeAppliances.children[j].clientHeight
                                ) {
                                    availableHeight -= largeAppliances.children[j].clientHeight;
                                    j++;
                                    totalLarge--;
                                    totalSelectedAndLarge--;
                                }
                                halfed = false;
                            } else {
                                availableHeight = 750;
                                var newClone = cloneIt("My details and requirements", "Large Appliances");
                                let newTableBody = newClone.getElementsByClassName("selectedAppliances")[0];
                                while (
                                    largeAppliances.children[j] &&
                                    availableHeight >= largeAppliances.children[j].clientHeight
                                ) {
                                    availableHeight -= largeAppliances.children[j].clientHeight;
                                    newTableBody.appendChild(largeAppliances.children[j]);
                                    totalLarge--;
                                    totalSelectedAndLarge--;
                                }
                            }
                        }
                    }
                } else {
                    if(availableHeight > 134) {
                        if(newClone) {
                            let heavyAppliancesTable = document.getElementById("heavyAppliancesTable");
                            // let largeAppliancesTable = document.getElementById("largeAppliancesTable");
                            newClone.appendChild(heavyAppliancesTable);
                            // newClone.appendChild(largeAppliancesTable);
                            availableHeight-=134;
                        } else {
                            availableHeight-=134;
                        }
                        while (
                            heavyAppliances.children[k] &&
                            availableHeight >= heavyAppliances.children[k].clientHeight
                        ) {
                            availableHeight -= heavyAppliances.children[k].clientHeight;
                            k++;
                            totalHeavy--;
                        }
                    } else {
                        availableHeight = 750;
                        if(!k){
                            let heavyAppliancesTable = document.getElementById("heavyAppliancesTable");
                            heavyAppliancesTable.remove();
                        } 
                        var newClone = cloneIt("My details and requirements", "Heavy Appliances");
                        let newTableBody = newClone.getElementsByClassName("selectedAppliances")[0];
                        while (
                            heavyAppliances.children[k] &&
                            availableHeight >= heavyAppliances.children[k].clientHeight
                        ) {
                            availableHeight -= heavyAppliances.children[k].clientHeight;
                            newTableBody.appendChild(heavyAppliances.children[k]);
                            totalHeavy--;
                        }
                    }
                }
            }
            window.scriptExecuted = true;
        }
        // triggering script with a delay
        setTimeout(cloneAppliances, 1000);


    },
    data() {
        return {
            reportData:{},
            annualProduction:0,
            annualSavings:0,
            solarCapacity:0,
            batteryCapacity:0,
            batteryFeatures:[],
            recommendedPartners:[],
            inverterProductName:'',
            inverterQuantity:'',
            inverterCapacity:0,
            additionalSavings:'',
            withoutSolIC:0,
            withoutSolBC:0,
            withSolIC:0,
            withSolBC:0,
            co2Offset:0,
            equivalentForestsSaved:0,
            coalBurnAvoided:0,
            userInfo:{},
            userLookingFor:'',
            hoursOfBackup:0,
            totalOwnedAppliances:[],
            avgMonthlyBill:0,
            avgPricePerUnit:0.1,
            estimatedMonthlyConsumption:0,
            smallAppliances:[],
            largeAppliances:[],
            heavyAppliances:[],
            isThisIdCritical:{},
            critialAppliances:[],
        }
    },
    methods: {
        formatNumberInternational,
        async fetchReportInfo(){
            let email = this.$route.query.email;
            const response =  await API.SOLARK.FETCH_SOLARK_REPORT_INFO(email);
            this.reportData = response.data.results[0]['report_json'];
            this.critialAppliances = [... this.reportData['final_critical_list']];
            this.annualProduction = Number(this.reportData['solark_report_additional_data']['annualProduction'])
            this.annualSavings = (Number(this.reportData['solark_report_additional_data']['annualSavings']))
            this.solarCapacity = (Number(this.reportData['solark_report_additional_data']['solarCapacity']))
            this.batteryCapacity = (Number(this.reportData['solark_report_additional_data']['batteryCapacity']))
            this.batteryFeatures = [... this.reportData['solark_report_additional_data']['batteryFeatures']]
            this.recommendedPartners = [... this.reportData['solark_report_additional_data']['recommendedPartners']]
            this.inverterProductName = this.reportData['solark_report_additional_data']['inverterProductName']
            this.inverterQuantity = this.reportData['solark_report_additional_data']['inverterQuantity']
            this.inverterCapacity = (Number(this.reportData['solark_report_additional_data']['inverterCapacity']))
            this.additionalSavings = (Number(this.reportData['solark_report_additional_data']['additionalSavings']))
            this.withoutSolIC = (this.reportData['solark_report_additional_data']['withoutSolIC'])
            this.withoutSolBC = (this.reportData['solark_report_additional_data']['withoutSolBC'])
            this.withSolIC = (this.reportData['solark_report_additional_data']['withSolIC'])
            this.withSolBC = (this.reportData['solark_report_additional_data']['withSolBC'])
            this.co2Offset = (this.reportData['solark_report_additional_data']['co2Offset'])
            this.equivalentForestsSaved = (this.reportData['solark_report_additional_data']['equivalentForestsSaved'])
            this.coalBurnAvoided = (this.reportData['solark_report_additional_data']['coalBurnAvoided'])
            this.userInfo = this.reportData['solark_report_additional_data']['userInfo']
            this.avgMonthlyBill = (this.reportData['avgMonthlyBill']);
            this.avgPricePerUnit = this.reportData['avgPricePerUnit'];
            this.estimatedMonthlyConsumption = Number((this.avgMonthlyBill/this.avgPricePerUnit)).toFixed(2) ;
            this.userLookingFor = this.reportData['userLookingFor']
            this.hoursOfBackup = this.reportData['hoursOfBackup']
            this.totalOwnedAppliances = this.reportData['final_total_appliances'];
            this.segregateAppliances();
            this.assignCriticalId();
            waitForImagesToLoad();
        },
        assignCriticalId(){
            for(let i=0;i<this.critialAppliances.length;i++){
                let id = this.critialAppliances[i].id;
                this.isThisIdCritical[id]=true;
            }
        },
        segregateAppliances(){
            for(let i=0;i<this.totalOwnedAppliances.length;i++){
                let item = this.totalOwnedAppliances[i];
                item.default_load_kw = (Number(item.default_load_kw)).toFixed(2)
                item.operating_hour = (Number(item.operating_hour)).toFixed(2)
                let load = Number(item.default_load_kw);
                if(load<=1){
                    this.smallAppliances.push(item)
                }
                else if(load>1 && load<=5){
                    this.largeAppliances.push(item)
                }
                else if(load>5){
                    this.heavyAppliances.push(item);
                }
            }
            console.log("small, large, heavy",this.smallAppliances,this.largeAppliances,this.heavyAppliances);
        },
        showDiagram() {
            let data = JSON.parse(localStorage.getItem("jsonToSendForCalculation"));
            // let userLookingFor = data.userLookingFor;
            switch(true) {
                case this.inverterCapacity < 15 && this.userLookingFor == "Solar with Battery":
                return NoACYesDC5k8k12k;
                break;
                case this.inverterCapacity == 15 && this.userLookingFor == "Solar with Battery":
                return NoACYesDC15k;
                break;
                case this.inverterCapacity < 15 && this.userLookingFor == "Batteries Only":
                return NoACNoDC5k8k12k;
                break;
                case this.inverterCapacity == 15 && this.userLookingFor == "Batteries Only":
                return NoACNoDC15k;
            }
        },
    },
    computed: {

    },
    watch: {

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
input,
li {
    font-family: 'Poppins';
}

.parentContainer {
    width: 100%;
    background-color: #E8EDF2;
}

.childContainer {
    width: 794px;
    margin: auto;
}

.commonPageClass {
    height: 1122px;
    padding: 24px;
    background-color: #fff;
    /* margin-bottom: 16px; */
}

.heading {
    margin: 13px 0px;
    font-size: 24px;
    font-weight: 600;
    color: #F7941D;
}

.boxTwo {
    padding-right: 8px;
}

.prntBoxOne,
.prntBoxTwo,
.gridEqualCont,
.prntBoxOneOR {
    padding: 16px 16px 16px 24px;
    border: 1px solid #ccc;
    border-radius: 8px;
    display: grid;
    grid-template-columns: 224px 240px auto;
    gap: 24px;
    margin-bottom: 16px;
}

.prntBoxOne {
    gap: 16px;
}

.gridEqualCont {
    grid-template-columns: 1fr 1fr auto;
    margin-bottom: 0px;
}

.prntBoxTwo {
    grid-template-columns: 228px auto;
}

.boxOne,
.boxTwo {
    border-right: 1px solid #bfbfbf;
}

.cardHeading {
    font-size: 16px;
    font-weight: 600;
    color: #222;
    margin-bottom: 8px;
}

.flexRow {
    display: flex;
    gap: 14px;
}

.flexColumn {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.smallHeading,
.normalFont,
.smallFont {
    font-size: 14px;
    font-weight: bold;
    color: #222;
    white-space: nowrap;
}

.normalFont {
    font-weight: normal;
}

.smallFont {
    font-size: 12px;
    font-weight: normal;
    color: #808080;
}

.ulList {
    display: grid;
    grid-template-columns: auto auto;
    gap: 6px;
    list-style-type: disc;
    list-style-position: inside;
}

.flexNoGap {
    margin-top: 8px;
    display: flex;
}

.noGapBoxOne {
    padding-right: 11px;
    border-right: 1px solid #bfbfbf;
}

.noGapBoxTwo {
    padding-left: 11px;
}

.flexSmallRow {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    margin-top: 4px;
}

.diagram {
    margin-top: 4px;
    margin-bottom: 8px;
    width: 100%
}

.impactCard {
    display: flex;
    align-items: center;
    gap: 22px;
}

.imgBackground {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background-color: #E8EDF2;
    display: grid;
    place-items: center;
}

.impVal {
    font-size: 20px;
    font-weight: bold;
    color: #222;
}

.impUnit {
    font-size: 14px;
    font-weight: normal;
    color: #222;
}

.prntBoxOneOR {
    grid-template-columns: 240px auto auto;
    gap: 16px;
}

.labelOR {
    font-size: 14px;
    color: #777;
    margin-bottom: 4px;
}

.valOR {
    font-size: 16px;
    font-weight: bold;
    color: #222;
}

.headingOR {
    font-size: 14px;
    color: #222;
    font-weight: bold;
    margin-bottom: 4px;
}

.reqOR {
    grid-template-columns: auto auto;
    gap: 70px;
}

.tableOR {
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 8px;
}

.tableHeaderOR {
    height: 50px;
    padding: 13px 20px;
    background-color: #F2F2F2;
    border-bottom: 1px solid #bfbfbf;
}

.tableHeading {
    font-size: 16px;
    color: #222;
    font-weight: 600;
}

.tableBodyOR {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px 20px;
}

.blueHeadingsOR,
.tableValContOR {
    display: grid;
    grid-template-columns: 160px 103px 80px 137px 48px;
    justify-content: space-between;
    gap: 24px;
}

.blueHeading {
    color: #184D93;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
}

.tableValOR {
    font-size: 12px;
    color: #222;
}

.alignLeft {
    text-align: right;
}
</style>