<template>
    <div class="infoParentContainer">
      <el-dialog v-model="visiblePopupp" title="Basic Information" :close-on-click-modal="false" @close="handleClose">
        <el-scrollbar class="container">
          <p class="headings">Share your info to get access to the best energy management solutions and top product recommendations.</p>
          <div class="inputsContainer">
            <div class="inputCont">
              <p class="label">Name</p>
              <input type="text" class="inputTag" v-model="userInfo.name" :class="{error: errors.name}"/>
              <p class="errorText" v-if="errors.name">{{ errors.name }}</p>
            </div>
            <div class="inputCont">
              <p class="label">Email</p>
              <input type="text" class="inputTag" v-model="userInfo.emailId" :class="{error: errors.emailId}"/>
              <p class="errorText" v-if="errors.emailId">{{ errors.emailId }}</p>
            </div>
            <div class="inputCont">
              <p class="label">Phone No.</p>
              <!-- <input type="tel" class="inputTag" v-model="userInfo.mobileNo" :class="{error: errors.mobileNo}" minlength="10" maxlength="10" oninput="this.value = this.value.replace(/[^0-9]/g, '');" /> -->
              <!-- <vue-tel-input
                v-model="userInfo.mobileNo"
                mode="international"
                defaultCountry="US" 
                :dropdownOptions="{showFlags:true,showDialCodeInSelection:true,showDialCodeInList:false, showSearchBox:false}" 
                :autoFormat="false"
                :validCharactersOnly="true"
                :enabledFlags="true"
                @validate="validateClientNumber"
                @country-changed="setCountryCode"
              >
              </vue-tel-input>
              <p class="errorText" v-if="!isMobileNumberValid && isSubmitClicked">Please enter a valid mobile number.</p> -->
              <el-input @input="handleMobileNumberInput"
                v-model="userInfo.mobileNo" 
                ></el-input>
              <p class="errorText" v-if="errors.mobileNo">{{ errors.mobileNo }}</p>
            </div>
            <div class="inputCont">
              <p class="label">Address</p>
              <textarea type="text" class="textareaTag" v-model="userInfo.address" :class="{error: errors.address}"></textarea>
              <p class="errorText" v-if="errors.address">{{ errors.address }}</p>
            </div>
          </div>
          <div class="checkboxCont">
            <el-checkbox v-model="termsAndConditionsChecked" label="" />
            <p class="checkboxLine">I have read and agree to <span class="bold">Terms &amp; Conditions</span> . Sign me up for updates.</p>
          </div>
          <p class="errorText" v-if="errors.termsAndConditionsChecked">{{ errors.termsAndConditionsChecked }}</p>
          <el-button type="primary" class="btn" @click="submitDetails()" :loading="loadingStateButton">Submit</el-button>
        </el-scrollbar>
      </el-dialog>
    </div>
  </template>
  
  
<script >
import API from '@/services/api';
import { ref } from 'vue';


export default {
    props: {
        isBasicInformationPopupVisible: {
            type: Boolean,
            default: false,
        },
        pageNo:{
            type: Number,
            default:1,
        },
    },

    data() {
        return {
            userInfo: {
                name: null,
                emailId: null,
                mobileNo: null,
                address: JSON.parse(localStorage.getItem('jsonToSendForCalculation')).address,
                source: 'sol-ark',
                monthly_bill: 100,
            },    
            dialCode:'',
            termsAndConditionsChecked: false,
            errors: {},
            loadingStateButton: false,
            isMobileNumberValid: false,
            isSubmitClicked: false,
        };
    },

    computed: {
        visiblePopupp() {
            return this.$props.isBasicInformationPopupVisible;
        },
    },

    mounted() {
        this.avgMonthlyBill();
        this.gettingUserInfoFromLocalStorage();
    },

    methods: {
    handleMobileNumberInput(event) {
      // Replace alphabets and special characters that are not [(,),-," "] or numbers with empty string
      //console.log("Replacing",this.userInfo.mobileNo);
      let mobNo = this.userInfo.mobileNo;
      //this.userInfo.mobileNo = mobNo? mobNo.replace(/[^0-9()\-\s]/g, ''):'';
      //this.userInfo.mobileNo = mobNo ? mobNo.replace(/(?![2-9][0-8][0-9])[^0-9()\-\s]/g, '') : '';
      this.userInfo.mobileNo = mobNo ? mobNo.replace(/[^\d+\-\(\)\s]/g, '') : '';
    },
    handleClose() {
        this.$emit("close");
    },
    validateClientNumber(numberInfo){
        this.isMobileNumberValid = numberInfo.valid;
    },
    setCountryCode(country) {
        this.dialCode = '+'+country.dialCode
    },

    avgMonthlyBill() {
        let data = JSON.parse(localStorage.getItem("jsonToSendForCalculation")).avgMonthlyBill;
        this.userInfo.monthly_bill = data;
    },

    gettingUserInfoFromLocalStorage() {
        if(localStorage.getItem("userInfo") !== null) {
            let userInfoFromLocalStorage = JSON.parse(localStorage.getItem('userInfo'));
            this.userInfo.name = userInfoFromLocalStorage.name;
            this.userInfo.emailId = userInfoFromLocalStorage.emailId;
            this.userInfo.mobileNo = userInfoFromLocalStorage.mobileNo;
            this.userInfo.address = userInfoFromLocalStorage.address;
        }
    },

    validateForm() {
        const errors = {};

        if (!this.userInfo.name) {
            errors.name = "Name is required.";
        }

        if (!this.userInfo.emailId) {
            errors.emailId = "Email Id is required.";
        } else if (!this.isValidEmail(this.userInfo.emailId)) {
            errors.emailId = "Please enter a valid email Id.";
        } 

        // if (!this.userInfo.mobileNo) {
        //     errors.mobileNo = "Mobile No. is required.";
        // } else 
        if (this.userInfo.mobileNo && !this.isValidUSMobileNumber(this.userInfo.mobileNo)) {
            errors.mobileNo = "Please enter a valid US mobile number.";
        }
        //console.log(errors);

        if (!this.userInfo.address) {
            errors.address = "Address is required.";
        }

        if (!this.termsAndConditionsChecked) {
            errors.termsAndConditionsChecked = "Please accept Terms & Conditions.";
        }

        return errors;
    },

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    isValidUSMobileNumber(usMobileNumber){
        //const usMobRegex1 = /^(\(\d{3}\)\s\d{3}-\d{4}|\d{3}-\d{3}-\d{4})$/;
        //Accepts (555) 555-5555 or 555-555-5555 format
        //const usMobRegex2 = /^\(?([2-9][0-8][0-9])\)?[-.●]?([2-9][0-9]{2})[-.●]?([0-9]{4})$/;
        //Accepts 5555555555 or 555-555-5555 format and checks the validity of the digits also
        const usMobRegex3 = /^(?:\+1)?(?:[\d\+\-\(\)\s]*\d){10,11}$/;
        return usMobRegex3.test(usMobileNumber) && this.areDigitsMoreThan10(usMobileNumber);
    },
    areDigitsMoreThan10(usMobileNumber){
        // Remove the "+1" and all non-digit characters and check if the count of digits is exactly 10
        // const withoutPlusOne = usMobileNumber.replace(/^(\+1)|\D/g, '');
        // return withoutPlusOne.length === 10;
        // Remove "+1" if it exists and all non-digit characters
        const withoutPlusOneAndNonDigits = usMobileNumber.replace(/^(\+1)|\D/g, '');
        console.log(withoutPlusOneAndNonDigits);
        
        //If there is a "+" at the first pos but it is not followed by a "1"
        if(usMobileNumber.charAt(0) === "+" && usMobileNumber.charAt(1)!=="1" ) return false;
    
        // Check if the length is exactly 10 or if it's 11 with a leading "1"
        return (withoutPlusOneAndNonDigits.length === 10) ||
            (withoutPlusOneAndNonDigits.length === 11 && withoutPlusOneAndNonDigits.charAt(0) === '1');          
    },

    async submitDetails() {
        this.isSubmitClicked = true;
        const errors = this.validateForm();
        // removed from condition below && this.isMobileNumberValid
        if (Object.keys(errors).length === 0) {
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
            this.loadingStateButton = true;
            try {
                console.log("posting attempt");
                const postData = {
                    "name": this.userInfo.name,
                    "email": this.userInfo.emailId,
                    "phone": (this.userInfo.mobileNo) || "-",
                    "address": this.userInfo.address,
                    "source": this.userInfo.source,
                    "monthly_bill": this.userInfo.monthly_bill
                }
                let response = await API.SOLARK.POST_USER_DETAILS_INFO(postData);
                this.handleClose();
                this.$emit("pageNumberAfterNext",this.pageNo+1);
                // this.$router.push({ name: 'systemConfigRouteFile' });
            } catch (e) {
                if(e.response.data.phone || e.response.data.email) {
                    // this.$router.push({ name: 'systemConfigRouteFile' });
                    this.$emit("pageNumberAfterNext",this.pageNo+1);
                } else {
                    this.$message({
                    showClose: true,
                    message: "Something is wrong.Try again.",
                    type: "error",
                    center: true
                });
                }
                
                this.loadingStateButton = false;
            }
        } else {
            this.errors = errors;
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
a {
    font-family: 'Poppins';
}

.errorText {
    color: red;
    font-size: 14px;
    margin-top: 4px;
}

.infoParentContainer :deep() .el-dialog {
    width: 580px;
    border-radius: 8px !important;
    margin-top: 12vh !important;
}

.infoParentContainer :deep() .el-dialog__header {
    display: flex !important;
    align-items: center;
    height: 48px;
    width: 100%;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    padding: 0px 24px;
    background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
    font-family: 'Poppins';
}

.infoParentContainer :deep() .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    font-family: 'Poppins';
}

.infoParentContainer :deep() .el-dialog__headerbtn {
    top: -4px;
}

.infoParentContainer :deep() .el-dialog__headerbtn .el-dialog__close {
    color: #222;
    font-size: 24px;
    font-weight: 600;
}

.infoParentContainer :deep() .el-dialog__body {
    padding: 0px !important;
}


.infoParentContainer :deep() .el-scrollbar__wrap {
    overflow: auto;
    height: 100%;
    padding: 24px 24px 32px 24px;
    word-break: break-word;
}

.headings {
    color: #000;
    font-size: 16px;
    line-height: 1.5;
}

.inputsContainer {
    margin-top: 16px;
}

.inputCont {
    margin-bottom: 16px;
}

.label {
    font-size: 14px;
    font-weight: 600;
    color: #222;
    margin-bottom: 2px;
}

.inputTag,
.textareaTag {
    font-weight: 600;
    height: 48px;
    width: 100%;
    font-size: 16px;
    color: #000;
    padding: 16px;
    box-sizing: border-box;
    outline: none;
    border: 1px solid #999;
    border-radius: 4px;
    background-color: #fff;
}

.textareaTag {
    height: 96px;
    resize: none;
}

.btn {
    height: 48px;
    width: 100%;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    background-color: #f7941d;
    border: none;
    border-radius: 8px;
    margin-top: 12px;
}

.infoParentContainer :deep() .el-checkbox__inner {
    width: 24px;
    height: 24px;
    background-color: #fff;
    border: 1px solid #999;
    border-radius: 4px;
}

.infoParentContainer :deep() .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #f7941d;
}

.infoParentContainer :deep() .el-checkbox-group {
    display: flex;
    gap: 70px;
}

.infoParentContainer :deep() .el-checkbox-group {
    gap: 24px;
}

.infoParentContainer :deep() .el-checkbox__inner::after {
    border: 3px solid var(--el-checkbox-checked-icon-color);
    border-left: 0;
    border-top: 0;
    height: 12px;
    left: 7px;
    top: 2px;
    width: 4px;
}

.container :deep() .el-checkbox__label {
    font-size: 20px;
    color: #fff;
    padding-left: 24px;
}

.checkboxCont {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: -12px;
}

.checkboxLine {
    font-size: 14px;
    color: #000;
}

.bold {
    font-weight: bold;
    text-decoration: underline;
}

.infoParentContainer :deep() .vti__selection .vti__country-code{
  width: 34px;
}
.infoParentContainer :deep() .vue-tel-input{
  height: 48px;
  width: 100%;
  position: relative;
}
.infoParentContainer :deep() .vti__input{
    border: 1px solid #999;
    height: 48px;
    font-size: 16px;
    margin-top: -1px;
}
.infoParentContainer :deep() .vti__dropdown-arrow{
    display: none;
}

.infoParentContainer :deep() .vti__dropdown {
    position: inherit;
    pointer-events: none;
}

.infoParentContainer :deep() .vti__dropdown-list.below{
  top:48px ;
}

.el-input{
    height: 48px;
}
.el-input ::v-deep .el-input__wrapper {
    font-weight: 600;
    width: 100%;
    font-size: 16px;
    color: #000;
    padding: 16px;
    box-sizing: border-box;
    outline: none;
    border: 1px solid #999 !important;
    border-radius: 4px !important;
    background-color: #fff;
  }
  
.el-input ::v-deep .el-input__inner{
    color: #000;
    font-family: Poppins;   
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: normal; 
    letter-spacing: -1.5px;
  }


@media (max-width: 640px) {
    .infoParentContainer :deep() .el-dialog {
        width: 90vw !important;
        margin-top: 8vh !important;
    }

    .infoParentContainer :deep() .el-scrollbar__wrap {
        padding: 16px 16px 0px 16px;
        max-height: 70vh;
        margin-bottom: 16px;
    }
}
</style>