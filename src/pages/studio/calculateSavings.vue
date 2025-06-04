<template>
  <div class="containerCS">
    <p class="inputLabelCS">
      Submit your details to view your estimated savings and personalized design.
    </p>
    <div class="rupee">
      <span class="rupeeIcon" v-if="isRil">$</span>
      <span class="rupeeIcon" v-else>₹</span>
      <input
        v-model="billAmount"
        type="number"
        onkeydown="return event.keyCode !== 69"
        class="inputTag spaceLeft"
        placeholder="Enter Average Monthly Bill *"
      />
      <p class="billError" v-if="isRil && Number.isInteger(billAmount) && (billAmount<100)">
        {{'Value should be equal or more than 100'}}
      </p>
      <p class="billError" v-if="!isRil && Number.isInteger(billAmount) && (billAmount<1000)">
        {{'Value should be equal or more than 1000'}}
      </p>
    </div>
    <input type="text" v-model="name" class="inputTag" placeholder="Enter Your Name *" />
    <input type="number" v-model="mobileNum" onkeydown="return event.keyCode !== 69" class="inputTag" placeholder="Enter Your Mobile No. *" />
    <p class="billError" v-if="mobileNum && mobileNum>9999999999">
      {{'Value should have less than 10 digits'}}
    </p>
    <input type="text" v-model="emailId" class="inputTag" placeholder="Enter Your Email Id *" />
    <input type="text" v-model="address" class="inputTag" placeholder="Enter Your Address *" />
    <el-button 
      type="primary" 
      class="BtnMDCS"
      :disabled="!isSavingsFormValid"
      @click="submitSavingsFunction"
      >Submit & Calculate Savings</el-button
    >
  </div>
</template>

<script>
import { useStudioStore } from "../store/studioStore";
import {SAVINGS_STATE, REPORT_STATE, defaultComponentsData} from "./constants";
import { isRil } from "../../constants";
import API from '@/services/api';
import { uploadFileToBlob } from "@/utils.js";
import { v4 } from "uuid";

export default {
  data() {
    return {
      name: null,
      billAmount: null,
      mobileNum: null,
      emailId: null,
      leadId: null,
      leadAlreadyExistsInDB: false,
      studioStore: useStudioStore(),
      canvasImage: null,
      imageUUID: null,
      address: null,
      isRil,
    }
  },
  mounted() {
    let componentData = localStorage.getItem('componentData');
    if(componentData){
      componentData = JSON.parse(componentData);
      this.name = componentData.savingsData.name;
      this.billAmount = componentData.savingsData.billAmount;
      this.mobileNum = componentData.savingsData.mobileNum;
      this.emailId = componentData.savingsData.emailId;
      this.leadId = componentData.savingsData.leadId;
      this.address = componentData.savingsData.address;
      this.leadAlreadyExistsInDB = componentData.savingsData.leadAlreadyExistsInDB;
    }
    this.$stageInstance.placePanels();
  },
  computed: {
    currentAppState() {
      return this.studioStore.currentAppState;
    },
    isValidEmail() {
      return /^[^@]+@\w+(\.\w+)+\w$/.test(this.emailId);
    },
    validBillAmount(){
      return this.isRil ? this.billAmount > 99 : this.billAmount > 999
    },
    isSavingsFormValid() {
      if(this.name && this.address 
      && this.billAmount && this.validBillAmount 
      && this.mobileNum && this.mobileNum > 999999999 && this.mobileNum <= 9999999999  
      && this.emailId && this.isValidEmail){
        return true;
      }
      return false;
    },
  },
  methods: {
    uploadFileToBlob,
    cleanBase64String(base64String) {
      // Define a regular expression to match valid base64 characters
      const base64Regex = /^[A-Za-z0-9+/=]+$/;
      // Use the regular expression to filter out invalid characters
      const cleanString = base64String.replace(new RegExp(`[^${base64Regex.source}]`, 'g'), '');
      return cleanString;
    },
    async submitSavingsFunction() {
      if(this.currentAppState === SAVINGS_STATE){
        //upload the image for rel
        if (localStorage.getItem('canvasImage')) {
          this.canvasImage = localStorage.getItem('canvasImage');
        } else {
          this.canvasImage = "https://cdn.pixabay.com/photo/2012/08/27/14/19/mountains-55067__340.png";
        }
        if (this.$stageInstance) {
          const uuidImage =  v4();
          console.log(uuidImage);
          this.imageUUID = uuidImage;
          //console.log(this.canvasImage);
          //remove prefix
          const base64WithoutPrefix = this.canvasImage.split(',')[1];
          //check and remove invalid characters
          const cleanedBase64 = this.cleanBase64String(base64WithoutPrefix);
          const binaryData = Uint8Array.from(
            atob(cleanedBase64),
            (char) => char.charCodeAt(0)
          );
          // Create a Blob object from binary data
          const binaryImage =new Blob([binaryData], { type: "image/png" });
          console.log(binaryImage);
          await this.uploadFileToBlob(binaryImage,uuidImage);
        }
        this.studioStore.$patch({
          currentAppState: REPORT_STATE,
        });
        const postData = {
          "name": this.name,
          "phone": this.mobileNum,
          "email": this.emailId,
          "source": isRil ? "sensehawk" : "tata_power",
          "monthly_bill": this.billAmount,
          "address": this.address,
        }
        // Conditionally add the "map_image" property if this.imageUUID exists
        if (this.imageUUID!==null) {
          postData.map_image = {
            "file_name": this.imageUUID,
            "file_info": "map_image",
            "file_type": "image",
          };
        }
        console.log(postData);
        if(!this.leadAlreadyExistsInDB){
          try{
            const response = await API.STUDIO_API.CREATE_LEAD(postData);
            if(response.data.hasOwnProperty('id')){
              this.leadId = response.data.id;
            }
            this.leadAlreadyExistsInDB = true;
          }
          catch(e){
            console.error(e);
          }
        }
        else if(this.leadId){
          const postData = {};
          let componentData = JSON.parse(localStorage.getItem('componentData'));
          if(this.name !== componentData.savingsData.name){
            postData.name = this.name;
          }
          if(this.mobileNum !== componentData.savingsData.mobileNum){
            postData.phone = this.mobileNum;
          }
          if(this.emailId !== componentData.savingsData.emailId){
            postData.email = this.emailId;
          }
          if(this.billAmount !== componentData.savingsData.billAmount){
            postData.monthly_bill = this.billAmount;
          }
          if(this.address !== componentData.savingsData.address){
            postData.address = this.address;
          }
          try{
            await API.STUDIO_API.PATCH_LEAD(this.leadId, postData);
          }
          catch(e){
            console.error(e);
          }
        }
        this.setSavingsDataInLocalStorage();
        this.$router.push({name: 'reportSummary'});
      }
    },
    setSavingsDataInLocalStorage(){
      const savingsData = {
        name: this.name,
        billAmount: this.billAmount,
        mobileNum: this.mobileNum,
        emailId: this.emailId,
        leadId: this.leadId,
        address: this.address,
        leadAlreadyExistsInDB: this.leadAlreadyExistsInDB,
      }
      let componentJSON = localStorage.getItem('componentData') ? JSON.parse(localStorage.getItem('componentData')) : defaultComponentsData();
      componentJSON.savingsData = savingsData;
      localStorage.setItem('componentData',JSON.stringify(componentJSON));
    },
  }
}
</script>

<style  scoped>
@font-face {
  font-family: "SegoeUI";
  src: url(/fonts/SegoeUI.ttf);
}

@media (max-width: 1100px) {
  .containerCS {
    /* display: none; */
    position: fixed;
    z-index: 100;
    bottom: 0px;
    width: 100%;
    padding: 24px 16px;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    background-color: #fff;
  }

  .inputLabelCS {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.38;
    margin-top: -4px;
    margin-bottom: 16px;
    text-align: center;
    font-family: "SegoeUI";
  }

  .inputTag {
    height: 48px;
    width: 100%;
    font-size: 16px;
    color: #222;
    padding: 16px;
    box-sizing: border-box;
    outline: none;
    border: 1px solid #999;
    border-radius: 4px;
    background-color: #fff;
    margin-bottom: 14px;
    font-family: "SegoeUI";
  }

  .rupee {
    position: relative;
  }

  .billError {
    color: rgb(214, 12, 12);
    font-size: 13px;
    margin-top: -10px;
    margin-bottom: 8px;
  }

  .rupeeIcon {
    position: absolute;
    top: 16px;
    left: 16px;
  }

  .spaceLeft {
    padding-left: 32px;
  }

  .BtnMDCS {
    font-size: 16px;
    font-weight: 600;
    width: 100%;
    height: 48px;
  }
  
  .BtnMDCS:hover {
    background-color: #409eff;
  }

  .BtnMDCS.is-disabled, .BtnMDCS.is-disabled:focus, .BtnMDCS.is-disabled:hover {
    color: #ccc;
    background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
    border: 1px solid #ccc;
  }
}
</style>

