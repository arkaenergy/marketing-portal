<template>
    <div class="infoParentContainer">
        <el-dialog v-model="visiblePopupp" title="Basic Information" :close-on-click-modal="false" @close="handleClose" >
            <el-scrollbar class="container">
                <p class="headings">Please fill out these details to view your savings.</p>
                <div class="inputsContainer">
                    <div class="inputCont">
                        <p class="label">Name</p>
                        <input v-model.trim="userName" type="text" class="inputTag" />
                    </div>
                    <div class="inputCont">
                        <p class="label">Mobile No.</p>
                        <input v-model.trim="userNumber" ref="mobileInput" type="number" class="inputTag" />
                    </div>
                    <div class="inputCont">
                        <p class="label">Email Id</p>
                        <input v-model.trim="userEmail" type="email" class="inputTag" />
                    </div>
                </div>
                <el-button
                    type="primary"
                    class="btn"
                    @click.prevent="submitButtonHandler"
                    :disabled = "isLoading"
                    v-loading = "isLoading"
                >
                    Submit
                </el-button>
            </el-scrollbar>
        </el-dialog>
        <OTPpopup
            v-if="isOTPPopupVisible"
            :isOTPPopupVisible="isOTPPopupVisible"
            @close="isOTPPopupVisible=false"
            @close-automate = "afterOtpVerfication()"
            :mobile = "userNumber.toString()"
            @create-lead = createLead()
        />
    </div>
</template>
  
<script >
import utils from '@/pages/siteSurvey/utils'
import OTPpopup from './otpPopup.vue';
import API from '../../services/api/waareeAPI'

export default {
    components: {
        OTPpopup,
    },

    props: {
        isInformationPopupVisible: {
            type: Boolean,
            default: false,
        },
        monthlyBill: {
            type: Number,
            default: null,
        },
    },

    data() {
        return {
            allIcon: utils.images,
            isOTPPopupVisible: false,
            userName:'',
            userNumber:null,
            userEmail:'',
            isLoading:false
        };
    },

    computed: {
        visiblePopupp() {
            return this.$props.isInformationPopupVisible;
        },
    },

    methods: {
        handleClose() {
            this.$emit("close");
        },
        isValidName(){
            const nameReg = /^[A-Za-z\s]*$/;
            if( this.userNumber && this.userName.toString().match(nameReg) ) return true;
             
            return false;
        },
        isValidEmail(){
            const emailReg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            
            if( this.userEmail && this.userEmail.toString().match(emailReg)) return true;

            return false;
        },
        isValidPhone(){
            const phoneReg = /^\d{10}$/;
            if( this.userNumber && this.userNumber.toString().match(phoneReg) ) return true;
            
            return false;
        },
        displayErrorPopup(errMsg){
            this.$message({
                showClose: true,
                message: errMsg,
                type: "error",
                center: true
            })
        },
        async submitButtonHandler(){
            
            if(!this.userName || !this.userNumber || !this.userEmail){
                this.displayErrorPopup("Enter all values");
                return;
            }

            if(!this.isValidName()){
                this.displayErrorPopup('Name should contain letters only.');
                return;
            }

            if(!this.isValidPhone()){
                this.displayErrorPopup('Number should contain 10 digits.');
                return;
            }

            if(!this.isValidEmail()){
                this.displayErrorPopup('Enter valid email.');
                return;
            }

            const requestBody = {
                phone : `+91${this.userNumber}`
            }

            try{
                this.isLoading = true;
                let response = await API.SEND_OTP(requestBody);
                this.isLoading = false;
                if(response.status === 201){
                    this.$message({
                        showClose: true,
                        message: response.data,
                        type: "success",
                        center: true
                    })
                }
                this.isOTPPopupVisible = true;
            }catch(error){
                this.isLoading = false;
                let errorMsg;
                if( error.response.status === 400
                    && error.response.data === 'Invalid Number'){
                    errorMsg = 'Invalid mobile number, try again.';
                    this.userNumber = null;
                    this.$refs.mobileInput.focus();
                }else{
                    errorMsg = error.message;
                }
                this.$message({
                    showClose: true,
                    message: errorMsg,
                    type: "error",
                    center: true
                })
            }
        },
        afterOtpVerfication(){
            this.handleClose();
            this.$emit('everything-visible')
        },

        async createLead(){
            this.$emit('fetch-finance-loader');
            this.isOTPPopupVisible=false;
            const create_lead_body = {
                name : this.userName,
                email : this.userEmail,
                phone : this.userNumber,
                source : "waaree",
                monthly_bill: this.monthlyBill
            }
            try {
                const createLeadResponse =  await API.CREATE_LEAD(create_lead_body);
                console.log(createLeadResponse);
                if(createLeadResponse.status === 201 || createLeadResponse.status === 200){
                const id = createLeadResponse.data.id;
                this.$emit('user-verified')
                this.$emit('financial-api-call',{leadId: id});
            }
            }catch(error){
                console.log(error)
                this.$emit('fetch-finance-loader');
                let errorMessage = "";
                if(error.response?.data?.phone){
                    errorMessage = error.response?.data?.phone[0];
                }else if(error.response?.data?.email){
                    errorMessage = error.response?.data?.email[0];
                }else{
                    errorMessage = error.message;
                }
            
                this.$message({
                    showClose: true,
                    message: errorMessage,
                    type: "error",
                    center: true
                })
                
            }
        }

    },
};
</script>
  
<style scoped>
@font-face {
    font-family: "ceraPro";
    src: url(./assets/fonts/CeraProMedium.otf);
}

.infoParentContainer :deep() .el-dialog {
    width: 498px;
    max-width: 498px !important;
    border-radius: 8px !important;
    margin-top: 20vh !important;
}

.infoParentContainer :deep() .el-dialog__header {
    display: flex !important;
    align-items: center;
    height: 40px;
    width: 100%;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    padding: 0px 24px;
    background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
}

.infoParentContainer :deep() .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    font-family: "ceraPro";
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
    overflow: hidden;
    max-height: 670px;
    overflow-y: scroll;
}

.headings {
    color: #000;
    font-size: 15px;
}

.inputsContainer {
    margin-top: 16px;
    margin-bottom: 8px;
}

.label {
    font-size: 14px;
    font-weight: 500;
    color: #222;
    margin-bottom: 6px;
    font-family: "ceraPro";
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
    margin-bottom: 16px;
    font-family: "ceraPro";
}

.btn {
    height: 48px;
    width: 100%;
    font-size: 18px;
    font-weight: bold;
    color: #000;
    background-color: #ffdb27;
    border: none;
    font-family: "ceraPro";
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

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
input[type=number] {
    -moz-appearance: textfield;
}
</style>