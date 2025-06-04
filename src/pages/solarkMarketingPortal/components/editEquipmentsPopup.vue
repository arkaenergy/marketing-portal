<template>
    <div class="equipmentParentContainer">
        <el-dialog v-model="visiblePopupp" title="Add/Edit Equipments" :close-on-click-modal="false" @close="handleClose">
            <div class="header">
                <p class="headerTitle firstHeaderTitle">Appliance<br/>Name</p>
                <p class="headerTitle">Operating Power<br/>(in kW)</p>
                <p class="headerTitle">Usage Hours</p>
                <p class="headerTitle">Number of<br/>Appliances</p>
                <p class="headerTitle">Essential Load</p>
            </div>
            <el-scrollbar class="container" always>
                <div class="inputsContainer" v-for="appliance in totalAllAppliancesArray" :key="appliance">
                    <div class="inputCont">
                        <el-checkbox :label="appliance.name" v-model="appliance.isChecked" @change="checkOtherAppliancesToUntick(appliance)" />
                        <div class="inpDiv">
                            <p class="units">kW</p>
                            <input type="text" v-model="appliance.default_load_kw" class="inputTag kwhInp" oninput="this.value = this.value.replace(/[^0-9.]/g, '');"/>
                        </div>
                        <input type="text" v-model="appliance.operating_hour" class="inputTag usageHrInp" oninput="this.value = this.value.replace(/[^0-9.]/g, '');"/>
                        <input type="text" v-model="appliance.quantity" class="inputTag noOfApplInp" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                        <!-- <el-select v-model="appliance.isCritical" class="m-2" :placeholder="value">
                            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select> -->
                        <el-switch v-model="appliance.isCritical" size="large"/>
                    </div>
                </div>
                <div class="inputsContainer">
                    <div class="inputCont flexStart" v-if="addEquipment">
                        <div>
                            <input type="text" class="addInputTag" v-model="newAppliance.name" placeholder="Appliance Name"/>
                            <p class="errorText" v-if="errors.applianceName">This field is required.</p>
                        </div>
                        <div class="inpDiv">
                            <p class="units">kWh</p>
                            <input type="text"  v-model="newAppliance.default_load_kw" class="inputTag kwhInp" oninput="this.value = this.value.replace(/[^0-9.]/g, '');"/>
                            <p class="errorText" v-if="errors.operatingPower">This field is required.</p>
                        </div>
                        <div>
                            <input type="text" v-model="newAppliance.operating_hour" class="inputTag usageHrInp" oninput="this.value = this.value.replace(/[^0-9.]/g, '');"/>
                            <p class="errorText" v-if="errors.usageHours">This field is required.</p>
                        </div>
                        <div>
                            <input type="text" v-model="newAppliance.quantity" class="inputTag noOfApplInp" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                            <p class="errorText" v-if="errors.noOfAppl">This field is required.</p>
                        </div>
                        <div class="flexCont">
                            <!-- <el-select v-model="newAppliance.isCritical" class="m-2" :placeholder="value">
                                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select> -->
                            <el-switch v-model="newAppliance.isCritical" size="large"/>
                            <img src="../assets/img/tickIcon.svg" class="tickIcon" @click="validationFunc()" />
                        </div>
                    </div>
                </div>
                <p class="addEquipment" @click="addEquipment = true">Add more appliances</p>
            </el-scrollbar>
            <div class="footerCont">
                <el-button type="primary" class="closeBtn" @click="handleClose()">Close</el-button>
                <el-button type="primary" class="updateBtn" @click="submitDetails()">Update</el-button>
            </div>
        </el-dialog>
    </div>
</template>
  
<script >
// import { v4 as uuidv4 } from 'uuid';
import { v4 } from 'uuid';


export default {
    components: {
    },

    props: {
        isEditEquipmentsPopupVisible: {
            type: Boolean,
            default: false,
        },
    },
    created(){
        this.JSONTofetchAppliancesFromID = JSON.parse(localStorage.getItem('id-mapping-appliances'))
        // debugger
        console.log("just inside created value of id mapping of json", JSON.parse(JSON.stringify(this.JSONTofetchAppliancesFromID)));
        // debugger
        let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
        this.criticalListOfJson = JSON.parse(JSON.stringify(data['final_critical_list'])); 
        this.totalLoadAppliances = JSON.parse(JSON.stringify(data['final_total_appliances'])); 

        this.linkCriticalIDToBoolean();
        this.linkTotalLoadAppliancesToBoolean();
        this.totalAllAppliancesArray = Object.values(this.JSONTofetchAppliancesFromID);
        this.fixedValueAfterPoint();
        this.addDefaultAndCriticalColumnToAllAppliances();
    },

    data() {
        return {
            checked1: false,
            addEquipment: false,
            value: 'Yes',
            appliances: ['Boat Lift Motor','Electric Vehicle Charger','Cooking Range','Cooking Cooktop','Cooking Ovens'],
            options: [
                {
                    value: 'Yes',
                    label: 'Yes',
                },
                {
                    value: 'No',
                    label: 'No',
                }
            ],
            JSONTofetchAppliancesFromID:{},
            criticalListOfJson:[],
            totalLoadAppliances:[],
            totalAllAppliancesArray:[],
            isThisCriticalID:{},
            isThisLoadApplianceID:{},
            newAppliance:{
                'name':'',
                'isChecked': true,
                'isCritical': false,
                'default_load_kw':0,
                'operating_hour':0,
                'quantity':1,
                'id':null
            },
            errors: {
                applianceName: false,
                operatingPower: false,
                usageHours: false,
                noOfAppl: false,
            }
        };
    },

    mounted() {
        console.log("Mounted");
    },
    computed: {
        visiblePopupp() {
            return this.$props.isEditEquipmentsPopupVisible;
        },
        // uuid(){
        //     return  uuidv4();
        // },
    },

    methods: {
        fixedValueAfterPoint() {
            for (let i = 0; i < this.totalAllAppliancesArray.length; i++) {
                let x1 =parseFloat(this.totalAllAppliancesArray[i].default_load_kw).toFixed(2); 
                let x2 = Math.trunc(x1);
                let y1 = parseFloat(this.totalAllAppliancesArray[i].operating_hour).toFixed(1); 
                let y2 = Math.trunc(y1);
                // this.totalAllAppliancesArray[i].default_load_kw = ;
                // let this.totalAllAppliancesArray[i].operating_hour = 
                if(Math.abs(x1-x2)>0){
                    this.totalAllAppliancesArray[i].default_load_kw = x1;
                }
                else{
                    this.totalAllAppliancesArray[i].default_load_kw = x2;

                }

                if(Math.abs(y1-y2)>0){
                    this.totalAllAppliancesArray[i].operating_hour =  y1;
                }
                else{
                    this.totalAllAppliancesArray[i].operating_hour = y2;

                }
            }
        },
        handleClose() {
            console.log("Hnadle Close");
            this.$emit("close");
        },
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
        addDefaultAndCriticalColumnToAllAppliances(){
            for(let i=0;i<this.totalAllAppliancesArray.length;i++){
                let id = this.totalAllAppliancesArray[i]['id']
                if(this.isThisCriticalID[id]){
                    this.totalAllAppliancesArray[i]['isCritical'] = true;
                }
                else{
                    this.totalAllAppliancesArray[i]['isCritical'] = false;
                }
                if(this.isThisLoadApplianceID[id]){
                    this.totalAllAppliancesArray[i]['isChecked'] = true;
                }
                else{
                    this.totalAllAppliancesArray[i]['isChecked'] = false;
                }
            }
        },

        validationFunc() {
            if(this.newAppliance.name.length == 0) {
                this.errors.applianceName = true;
            } else {
                this.errors.applianceName = false;
            }
            if(this.newAppliance.default_load_kw.length == 0) {
                this.errors.operatingPower = true;
            } else {
                this.errors.operatingPower = false;
            }
            if(this.newAppliance.operating_hour.length == 0) {
                this.errors.usageHours = true;
            } else {
                this.errors.usageHours = false;
            }
            if(this.newAppliance.quantity.length == 0) {
                this.errors.noOfAppl = true;
            } else {
                this.errors.noOfAppl = false;
            }
            if(this.errors.noOfAppl == false && this.errors.usageHours == false &&  this.errors.operatingPower == false && this.errors.applianceName == false) {
                this.addMoreAppliance();
            }
        },

        addMoreAppliance(){
            this.uuid = v4();
            this.newAppliance['id'] = this.uuid;
            this.totalAllAppliancesArray.push(this.newAppliance);
            this.newAppliance = {
                'name':'',
                'isChecked': true,
                'isCritical': false,
                'default_load_kw':0,
                'operating_hour':0,
                'quantity':1,
                'id':null
            }
            this.addEquipment = false;
            console.log("after adding new appliance",this.totalAllAppliancesArray);
        },
        submitDetails() {   
            // Now we need to update Local Storage of id-mapping-appliances with updated totalAllAppliancesArray
            let updatedJsonForIdMappingAppliances = {}
            for(let i=0;i<this.totalAllAppliancesArray.length;i++){
                updatedJsonForIdMappingAppliances[this.totalAllAppliancesArray[i]['id']] = this.totalAllAppliancesArray[i];
            }
            console.log("updated id mapping json",updatedJsonForIdMappingAppliances);
            localStorage.setItem('id-mapping-appliances',JSON.stringify(updatedJsonForIdMappingAppliances))
            // Now we need to update the critical list and total load appliances list
            let updatedCriticalListOfJson=[];
            let updatedLoadAppliancesListOfJson=[];
            for(let i=0;i<this.totalAllAppliancesArray.length;i++){
                let appliance = this.totalAllAppliancesArray[i];
                if(appliance['isChecked']==true){
                    updatedLoadAppliancesListOfJson.push(appliance);
                }
                if(appliance['isChecked']==true && appliance['isCritical']==true){
                    updatedCriticalListOfJson.push(appliance);
                }
            }
            let data = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
            data['final_critical_list'] = updatedCriticalListOfJson;
            data['final_total_appliances'] = updatedLoadAppliancesListOfJson;
            localStorage.setItem('jsonToSendForCalculation',JSON.stringify(data));
            ElMessage({
                message: 'Successfully Updated!',
                type: 'success',
            })
        },
        checkOtherAppliancesToUntick(appliance){
            // Either electric water or gas water heater should be there. (13,3)
            if([3,13].includes(Number(appliance['id']))){
                for(let i=0;i<this.totalAllAppliancesArray.length;i++){
                    let id = this.totalAllAppliancesArray[i]['id'];
                    if(id!= appliance['id'] && [3,13].includes(Number(id))){
                        this.totalAllAppliancesArray[i]['isChecked']=false;
                    }
                }
            }
             // Either Cooking range or gas cooktop stove should be there. (14,2)
            else if([2,14].includes(Number(appliance['id']))){
                for(let i=0;i<this.totalAllAppliancesArray.length;i++){
                    let id = this.totalAllAppliancesArray[i]['id'];
                    if(id!= appliance['id'] && [2,14].includes(Number(id))){
                        this.totalAllAppliancesArray[i]['isChecked']=false;
                    }
                }
            }
            //  Either Gas Dryer or Clother Dryer should be there. (16,1)
            else if([1,16].includes(Number(appliance['id']))){
                for(let i=0;i<this.totalAllAppliancesArray.length;i++){
                    let id = this.totalAllAppliancesArray[i]['id'];
                    if(id!= appliance['id'] && [1,16].includes(Number(id))){
                        this.totalAllAppliancesArray[i]['isChecked']=false;
                    }
                }
            }
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
    width: 1074px;
    border-radius: 8px !important;
    margin-top: 10vh !important;
}

.equipmentParentContainer :deep() .el-dialog__header {
    display: none !important;
    /* align-items: center;
    height: 48px;
    width: 100%;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    padding: 0px 24px;
    background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
    font-family: 'Poppins'; */
}

/* .equipmentParentContainer :deep() .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    font-family: 'Poppins';
}

.equipmentParentContainer :deep() .el-dialog__headerbtn {
    top: -4px;
}

.equipmentParentContainer :deep() .el-dialog__headerbtn .el-dialog__close {
    color: #222;
    font-size: 24px;
    font-weight: 600;
} */

.equipmentParentContainer :deep() .el-dialog__body {
    padding: 0px !important;
}


.header {
    display: grid;
    grid-template-columns: 1.5fr 1.3fr 1fr 1.2fr 0.7fr;
    gap: 24px;
    min-height: 56px;
    background-color: #e8edf2;
    padding: 16px 24px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}

.headerTitle {
    color: #184d93;
    font-size: 16px;
    font-weight: 600;
}

.firstHeaderTitle {
    padding-left: 38px;
}

.equipmentParentContainer :deep() .el-scrollbar__wrap {
    overflow: auto;
    height: 100%;
    padding: 24px 16px 24px 24px;
    word-break: break-word;
    max-height: 535px;
    overflow: hidden;
    overflow-y: scroll;
}

.inputsContainer {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 8px;
}

.headings,
.addHeadings {
    font-size: 14px;
    color: #777;
    font-weight: bold;
    min-width: 172px;
    margin-bottom: 4px;
}

.inputCont {
    display: grid;
    grid-template-columns: 1.5fr 1.3fr 1fr 1.2fr 0.7fr;
    gap: 24px;
    align-items: center;
}

.flexStart {
    align-items: flex-start;
}

.addEquipCont {
    margin-top: 24px;
}

.label {
    font-size: 14px;
    font-weight: 600;
    color: #222;
    margin-bottom: 2px;
}

.inpDiv {
    position: relative;
}

.inputTag,
.addInputTag {
    position: relative;
    height: 48px;
    width: 100%;
    font-size: 16px;
    color: #222;
    padding: 16px 12px;
    box-sizing: border-box;
    outline: none;
    border: 1px solid #999;
    border-radius: 8px;
    background-color: #fff;
}

.kwhInp,
.inpDiv {
    max-width: 125px;
}

.kwhInp {
    padding-right: 48px;
}

.usageHrInp,
.noOfApplInp {
    max-width: 76px;
}

.flexCont {
    display: flex;
    align-items: center;
    gap: 8px;
}

.tickIcon {
    cursor: pointer;
}

.paddingInput {
    padding: 8px 54px 8px 16px;
}

.units {
    position: absolute;
    top: 11px;
    right: 12px;
    font-size: 16px;
    color: #000;
    z-index: 1;
}

.addUnits {
    top: 36px;
}

.footerCont {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    padding: 24px;
    height: 100px;
    border-top: 1px solid #ccc;
}

.closeBtn {
    height: 50px;
    font-size: 16px;
    font-weight: bold;
    color: #016ead;
    background-color: #fff;
    border: 1px solid #016ead;
    border-radius: 6px;
    width: 114px;
}

.updateBtn {
    height: 50px;
    font-size: 16px;
    font-weight: bold;
    color: #fff;
    background-color: #f7941d;
    border: none;
    border-radius: 6px;
    width: 114px;
}

.equipmentParentContainer :deep() .el-checkbox {
    margin-top: 0px;
}

.equipmentParentContainer :deep() .el-checkbox__inner {
    width: 24px;
    height: 24px;
    background-color: #fff;
    border: 1px solid #999;
    border-radius: 4px;
}

.equipmentParentContainer :deep() .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #f7941d;
}

.equipmentParentContainer :deep() .el-checkbox-group {
    display: flex;
    gap: 70px;
}

.equipmentParentContainer :deep() .el-checkbox-group {
    gap: 24px;
}

.equipmentParentContainer :deep() .el-checkbox__inner::after {
    border: 3px solid var(--el-checkbox-checked-icon-color);
    border-left: 0;
    border-top: 0;
    height: 12px;
    left: 7px;
    top: 2px;
    width: 4px;
}

.container :deep() .el-checkbox__label {
    font-size: 16px;
    color: #000;
    padding-left: 16px;
}

.container :deep() .el-select {
    width: 76px;
}

.container :deep() .el-select .el-input__wrapper {
    outline: none;
    border: 1px solid #999;
    border-radius: 8px;
    box-shadow: none;
}

.container :deep() .el-input__inner {
    height: 48px;
    font-size: 16px;
    color: #222;
}

.container :deep() .el-select .el-input .el-select__caret {
    color: #222;
    font-size: 18px;
}

.addEquipment {
    font-size: 16px;
    font-weight: bold;
    color: #184d93;
    cursor: pointer;
    margin-top: 24px;
}

.addEquipment::before {
    content: "+";
    display: block;
    float: left;
    margin: -3px 6px 0 0;
    font-size: 20px;
}

@media (max-width: 640px) {
    .equipmentParentContainer :deep() .el-dialog {
        width: 90vw !important;
        margin-top: 8vh !important;
    }

    .equipmentParentContainer :deep() .el-scrollbar__wrap {
        padding: 16px 16px 0px 16px;
        max-height: 70vh;
        margin-bottom: 16px;
    }
}
</style>