<template>
        <div class="container" id="outerMostContainer">
            <div class="gridContainer">
                <div class="leftSide">
                    <div class="headingFlex">
                        <p class="heading">Sol-Ark Home Designer</p>
                        <button class="resetBtn" @click="$emit('reset')">Reset</button>
                    </div>
                    <p class="paragraph">Unlock the Power of Solar Efficiency for Your Home Energy Needs Calculations</p>
                    <div class="inputContainer">
                        <!-- <input type="text" class="inputTag" /> -->
                        <GMapAutocomplete
                            placeholder="What is your Address?"
                            @place_changed="setPlace"
                            ref="autocomplete"
                            :options="autocompleteOptions"
                            class= "inputTag"
                        >
                        </GMapAutocomplete>
                        <div class="locationCont" @click="getLocation()">
                            <img src=".././assets/location.svg" alt="" />
                        </div>
                    </div>
                    <p class="errorMsg errorMsg2" v-if="isValidationErrorInAddress">This field is required!</p>
                    <el-radio-group v-model="typeOfUser" class="gapCheckBox">
                        <el-radio  label="I’m the homeowner">I’m the homeowner</el-radio>
                        <el-radio  label="I’m the installer/developer">I’m the installer/developer</el-radio>
                        <el-radio  :label="otherUserValue">
                            <input type="text" v-model="typeOfUser" class="inputTag" :disabled=" !(isTypeOfUserInOtherCategory)"
                             :class="{disableInput: !(isTypeOfUserInOtherCategory)}" />
                        </el-radio>
                    </el-radio-group>
                    <p class="errorMsg" v-if="isValidationErrorForUserType">This field is required!</p>
                    <div class="monthlyBillCont">
                        <p class="demonstration ">What is your average monthly electricity bill?</p>
                        <div class="positionR">
                            <input class="billInp" v-model="avgMonthlyBill" disabled />
                            <p class="dollarSign ">$</p>
                        </div>
                    </div>
                    <div class="sliderNoCont">
                        <span class="checkBoxNo">$100</span>
                        <el-slider :max="500" :min="100" v-model="avgMonthlyBill" />
                        <span class="checkBoxNo">$500</span>
                    </div>
                </div>
                <div class="rightSide">
                    <!-- <img src="../assets/image.svg" alt="" /> -->
                    <GMapMap
                        :center="center"
                        :zoom="zoom"
                        :mapTypeId="mapType"
                        :tilt="0"
                        :class="mapImageStyler"
                        :options="{
                            mapTypeControl: false,
                            streetViewControl: false,
                            zoomControl: false,
                            fullscreenControl: false,
                            gestureHandling : gestureHandling,
                            minZoom: 4,
                            maxZoom: 21,
                        }"
                        disabledDefaultUI="true"
                        @center_changed="updateCenter"
                        @zoom_changed="updateZoom"
                        @dragend="dragend_method"
                        >
                    </GMapMap>
                    <img v-bind:src="allIcon.get('locationPin')" class="setMarkerPosition" alt="Marker">
                </div>
            </div>
            <div class="locationEnablePopup">
                <el-dialog
                    v-model="isLocPopupVisible"
                    title="Tips"
                >
                    <img v-bind:src="allIcon.get('Group2188')" class="crossIcon" @click="isLocPopupVisible = false"/>
                    <img src="../../../../public/assets/Group2827.svg" class="locPathImg"/>
                    <p class="headingPopup">
                    Location access denied
                    </p>
                    <p class="contentLocPopup">You have blocked this site from tracking your location. To use this, you need to change your location setting in your browser.</p>
                </el-dialog>
            </div>
        <Footer
            :pageNo="1"
            :contentsFromPage1ForValidation="contentsFromPage1ForValidation"
            :dataFromPage1ForSavingInLS="dataFromPage1ForSavingInLS"
            @triggerValidation="triggerValidation"
            @pageNumberAfterNext="pageNumberAfterNext"
            @pageNumberAfterBack="pageNumberAfterBack"
         />

        </div>
</template>

<script>
import Footer from "./footer.vue"
import utils from '@/pages/siteSurvey/utils';

export default {
    components: {
        Footer
    },
    created() {
    },
    mounted(){
        // this.delay(100).then(()=>{
        //     this.getLocation();
        // })
        this.initializeDataFromLS(); 
    },
    data() {
        return {
            typeOfUser: "I’m the homeowner",
            homeInfo: null,
            center: {
                lat: 37.78454178741125,
                lng: -122.4037594380287,
            },
            updatedCenter: {
                lat: 37.78454178741125,
                lng: -122.4037594380287,
            },
            address:'',
            state:'California',
            mapType: "hybrid",
            zoom: 20,
            gestureHandling:"greedy",
            allIcon: utils.images,
            isLocPopupVisible: false,
            // otherUserValue:"",
            avgMonthlyBill: 250,
            // contentsFromPage1ForValidation:{},
            isValidationErrorForUserType:false,
            isValidationErrorInAddress:false,
            autocompleteOptions: {
                componentRestrictions: { country: 'us' }, // Bias results to the United States
            },
        }
    },
    methods: {
        initializeDataFromLS(){
           let dataFromLS = JSON.parse(localStorage.getItem('jsonToSendForCalculation'));
           this.center = {... dataFromLS['center']};
           this.updatedCenter = {... this.center};
           this.typeOfUser = dataFromLS['typeOfUser'];
           this.zoom = dataFromLS['zoom'];
        //    this.otherUserValue = dataFromLS['otherUserValue'];
           this.avgMonthlyBill = dataFromLS['avgMonthlyBill'];
           this.state = dataFromLS['state'];
           this.address = dataFromLS['address'];
           this.$refs.autocomplete.$el.value = this.address;
        },
        triggerValidation(){
            if(this.isTypeOfUserInOtherCategory && !this.typeOfUser)
                this.isValidationErrorForUserType=true;
            if(!this.address)
                this.isValidationErrorInAddress = true;    
        },
        pageNumberAfterNext(pageNo){
            this.$emit("pageNumberAfterNext",pageNo);
        },
        pageNumberAfterBack(pageNo){
            this.$emit("pageNumberAfterBack",pageNo);
        },
        delay(time) {
            return new Promise(resolve => setTimeout(resolve, time));
        },
        updateCenter(latLng) {
            this.updatedCenter = {
                lat: latLng.lat(),
                lng: latLng.lng(),
            };
            // this center is set on purpose so that when we will be dragging the centre it will be changed and then on clicking getLocation it will show change//
            //otherwise no change will be visible
            this.center = {
                lat: '',
                lng:'',
            };
            //-----------------------------------------------------------------------------------------------------------------------------------------//
         },
        updateZoom(zoom) {
            const prevZoom = this.zoom;
            this.zoom = zoom;
            if(prevZoom !== zoom){
                this.setAddressForGivenCoordinates();
            }
            console.log("updated zoom", this.zoom);
        },
        dragend_method(latLng){
            // this.visible = false;
            this.setAddressForGivenCoordinates();
        },
        setPlace(place) {
            this.center = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            };
            this.updatedCenter = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            };
            let isSelectingFromAutocomplete=true;
            this.setAddressForGivenCoordinates(isSelectingFromAutocomplete);
        },
        setAddressForGivenCoordinates(isSelectingFromAutocomplete){
            var geocoder = new google.maps.Geocoder();
            var latLng = new google.maps.LatLng(this.updatedCenter.lat, this.updatedCenter.lng);
            var vm = this;
            if (geocoder) {
                geocoder.geocode({ 'latLng': latLng}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if(!isSelectingFromAutocomplete) // we only want the address to be auto fetched while zooming or dragging and not while selecting address
                        vm.$refs.autocomplete.$el.value = results[0].formatted_address;
                    vm.address = vm.$refs.autocomplete.$el.value;
                    for (let i = 0; i < results.length; i++) {
                            let state = results[i].address_components.filter((elements) => {
                            if (elements.types[0] == 'administrative_area_level_1') {
                               vm.state = elements.long_name;
                            }
                        })
                        break;
                    }
                }
                else {
                    console.log("Geocoding failed: " + status);
                }
                }); //geocoder.geocode()
            }      
        },
        getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.showPosition, this.locationFetchFail);
            } else { 
                alert("Geolocation is not supported by this browser.");
            }
        },
        locationFetchFail(e) {
            this.isLocPopupVisible = true;
        },
        showPosition(position) {
            this.center = {
                "lat": position.coords.latitude,
                "lng": position.coords.longitude
            }
            this.updatedCenter = {
                "lat": position.coords.latitude,
                "lng": position.coords.longitude
            }
            var geocoder = new google.maps.Geocoder();
            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var vm = this;
            if (geocoder) {
                geocoder.geocode({ 'latLng': latLng}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    vm.$refs.autocomplete.$el.value = results[0].formatted_address;
                    vm.address = results[0].formatted_address;
                    for (let i = 0; i < results.length; i++) {
                            let state = results[i].address_components.filter((elements) => {
                            if (elements.types[0] == 'administrative_area_level_1') {
                               vm.state = elements.long_name;
                            }
                        })
                        break;
                    }
                }
                else {
                    console.log("Geocoding failed: " + status);
                }
                }); //geocoder.geocode()
            }      
      
        },
    },
    computed: {
        contentsFromPage1ForValidation(){
            return {
                "typeOfUser": this.typeOfUser,
                // "otherUserValue": this.otherUserValue,
                "isTypeOfUserInOtherCategory": this.isTypeOfUserInOtherCategory,
                "address": this.address,
            }
        },
        dataFromPage1ForSavingInLS(){
            return {
                typeOfUser: this.typeOfUser,
                center: this.updatedCenter,
                zoom: this.zoom,
                otherUserValue:this.otherUserValue,
                avgMonthlyBill: this.avgMonthlyBill,
                state: this.state,
                address:this.address
            }
        },
        isTypeOfUserInOtherCategory(){
            let arr1 = ['I’m the homeowner','I’m the installer/developer']
            if(arr1.includes(this.typeOfUser))
                return false;
            else 
                return true;
        },
        otherUserValue(){
            if(this.isTypeOfUserInOtherCategory)
                return this.typeOfUser;
            else return '';    
        }
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

.mapImageStyler {
  /* height: calc(100vh - 156px); */
  width: 100%;
  position: relative;
}


.gridContainer {
    display: grid;
    grid-template-columns: auto 470px;
    place-items: center;
    gap: 60px;
    align-items: center;
    justify-content: space-between;
    border-radius: 16px;
    background-color: #F2F2F2;
    height: calc(100vh - 240px);
    min-height: 600px;
    padding: 0px 10vw;
}

.leftSide {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 820px;
}
.rightSide{
    background-color: lightblue;
    width: 100%;
    height: 400px;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
}

.vue-map-container {
    height: 400px;
    border-radius: 16px;
}

.setMarkerPosition {
  /* pointer-events: none; */
  height: 48px;
  color: red;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
}

.headingFlex {
    display: flex;
    align-items: center;
    gap: 16px;
}

.heading {
    font-size: 36px;
    font-weight: bold;
    color: #00101A;
}

.resetBtn {
    width: 105px;
    height: 44px;
    border-radius: 4px;
    background-color: #F2F2F2;
    font-size: 20px;
    font-weight: bold;
    color: #F7921E;
    border: none;
    cursor: pointer;
    border: 1px solid #F7921E;
}

.paragraph {
    font-size: 32px;
    color: #00101A;
    line-height: 48px;
}

.inputContainer {
    display: grid;
    grid-template-columns: auto 42px;
    border-radius: 4px;
    height: 44px;
    overflow: hidden;
}

.locationCont {
    display: grid;
    place-items: center;
    background-color: #fff;
    border-left: 1px solid #BFBFBF;
    padding: 2px 0px;
    cursor: pointer;
}

.inputTag {
    font-size: 16px;
    color: #0D0D0D;
    padding: 0px 16px;
    border: none;
    outline: none;
    border-radius: 4px;
    height: 44px;
    width: 100%;
    background-color: white;
}

.disableInput{
    cursor: not-allowed;
    color: white;
}

.container :deep() .gapCheckBox {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 8px;
}

.container :deep() .el-checkbox {
    margin: 0px;
}

.container :deep() .el-radio-group {
    display: flex;
    /* gap: 80px;
    row-gap: 24px; */
    align-items: self-start;
}

.container :deep() .el-radio__inner::after {
    width: 12px;
    height: 12px;
    background-color: #f7941d;
}

.container :deep() .el-radio__input.is-checked .el-radio__inner {
    border-color: #f7941d;
    background: #fff;
    border-width: 2px;
}

.container :deep() .el-radio__inner {
    width: 24px;
    height: 24px;
    background-color: #fff;
    border: 1px solid #BFBFBF;
}

.container :deep() .el-radio__label {
    font-size: 16px;
    color: #0D0D0D;
    font-family: 'Poppins';
}

.errorMsg{
    color: red;
    font-size: 14px;
    margin-left: 32px;
    margin-top: -10px
}
.errorMsg2{
    margin-left: 4px;
}

.checkBoxNo {
    font-size: 20px;
    color: #0D0D0D;
}

.sliderNoCont {
    display: grid;
    grid-template-columns: 46px auto 54px;
    gap: 24px;
    align-items: center;
    width: 100%;
}

.container :deep() .el-slider__bar {
    height: 8px;
    background-color: #f7941d;
    border-radius: 4px;
}

.container :deep() .el-slider__runway {
    height: 8px;
    border-radius: 4px;
    background-color: #BFBFBF;
}

.container :deep() .el-slider__button {
    width: 24px;
    height: 24px;
    background-color: #f7941d;
    border: 4px solid #fff;
    margin-top: 5px;
}

.container :deep() .el-checkbox__label {
    font-size: 16px;
    color: #0D0D0D;
    padding-left: 16px;
    width: 100%;
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

.monthlyBillCont {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    align-items: center;
}

.demonstration {
    font-size: 20px;
    color: #0D0D0D;
}

.dollarSign {
    position: absolute;
    top: 8px;
    left: 16px;
    color: #0D0D0D;
    font-size: 16px;
}

.billInp {
    width: 100%;
    max-width: 140px;
    font-size: 16px;
    text-align: end;
    height: 42px;
    padding-right: 16px;
    background-color: #F2F2F2;
    border-radius: 8px;
    border: 1px solid #BFBFBF;
    cursor: not-allowed;
}


@media (max-width: 1430px) {
    .gridContainer {
        padding: 0px 6vw;
        gap: 40px;
    }
}

@media (max-width: 1300px) {
    .gridContainer {
        grid-template-columns: 1fr;
        padding: 32px 32px;
        height: auto;
        min-height: auto;
    }
}
</style>