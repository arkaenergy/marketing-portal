<template>
    <div class="parentContainerSolark" >
        <div class="commonNavbar">
            <img src="./assets/img/Sol-Ark-Logo.png" class="navIcon" />
        </div>
        <span v-loading="isLoading">
            <HomeAndEnergyInfo 
            @onReset="onReset" />
        </span>
        <!-- <systemConfig v-if="showSystemConfigPage"/> -->
    </div>
</template>

<script>

import HomeAndEnergyInfo from "./components/homeAndEnergyInfo.vue";
import API from '@/services/api';
export default {
    components: {
        HomeAndEnergyInfo,
    },
    created(){
        this.getAllAppliancesInfo();
        this.getAdditionalInfo();
        this.initializeJSONToSend();
    },
    data() {
        return {
            isLoading:false,
            // steps: this.$route.params.steps,
            // showHomeAndEnergyPage: true,
            // showSystemConfigPage: false,
        }
    },

    // watch: {
    //     steps: {
    //         handler(val) {
    //             console.log("Inside home and energy", val);
    //         }
    //     }
    // },

    methods: {
        async getAllAppliancesInfo(){
            let response =  await API.SOLARK.FETCH_ALL_APPLIANCES_INFO();
            localStorage.setItem("all-incoming-appliances",JSON.stringify(response.data))
            let allincomingApplianceList = response.data;
            // now creating a json to map (appliance id) with appliance json
            let idMappingWithJSON = {}
            for(let i=0;i<allincomingApplianceList.length;i++){
                idMappingWithJSON[allincomingApplianceList[i]['id']] = allincomingApplianceList[i];
            }
            if(!localStorage.getItem('id-mapping-appliances'))
            localStorage.setItem("id-mapping-appliances",JSON.stringify(idMappingWithJSON))
        },
        async getAdditionalInfo(){
            let response = await API.SOLARK.FETCH_ADDITIONAL_INFO();
            localStorage.setItem("additional-info-solark",JSON.stringify(response.data.results))

        },
        initializeJSONToSend(){
            let jsonToSend = {
                'daily_energy_consumption_kwh':0,
                'pv_size_kw':0,
                'monthly_bill':0,
                'area_in_sqft':0,
                'final_critical_list': [],
                'final_total_appliances':[],
                'max_caping_of_inverter_kw':0,
                'coordinates':{},
                'no_of_days_of_backup':1,
                'additional_info_for_frontend':{
                    "homeInfo": {
                        zipCode: "",
                        avgMontlyEngConsump: 100,
                        avgMonthlyBill: 10,
                        homeAreaSq: 500,
                        AMPs: 200,
                        electricAppliances: [],
                        coordinates:{
                            lat:'',
                            lng:'',
                        }
                    },
                    "energyConsumptionInfo":{
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
                }
            }
            if(!localStorage.getItem('jsonToSendForCalculation'))
            localStorage.setItem("jsonToSendForCalculation",JSON.stringify(jsonToSend))

        },
        async onReset(){
            this.isLoading=true;
            await this.getAllAppliancesInfo();
            await this.getAdditionalInfo();
            this.initializeJSONToSend();
            if(!localStorage.getItem('current-page-no'))
            localStorage.setItem('current-page-no',JSON.stringify(1));
            this.isLoading=false;
        }
        // showComponent(val) {
        //     console.log("sflhfhs");
        //     this.showHomeAndEnergyPage = false;
        //     this.showSystemConfigPage = true;
        // }
    },
}



</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Poppins:wght@300;400;600&display=swap');


.parentContainerSolark {}

.commonNavbar {
    height: 96px;
    padding: 16px 32px;
    border: 1px solid #707070;
    background-color: #fff;
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


</style>