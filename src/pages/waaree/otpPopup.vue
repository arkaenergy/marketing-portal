<template>
    <div class="otpParentContainer">
        <el-dialog v-model="visiblePopupp" title="OTP" :close-on-click-modal="false" @close="handleClose" class="dialog"
            >
            <el-scrollbar class="container">
                <p class="headings">{{`Enter the 4 digit OTP sent to your ${isEmailVerification? `email ID` : `mobile number`}.`}}</p>
                    <div class="otpContainer">
                        <input v-for="(value, index) in otpValues"
                            :key="index" type="text" maxlength="1" class="otpInputs"
                            :value="value" @input="handleInput(index, $event.target.value)"
                            @keydown.backspace="handleBackspace(index)" ref="otpFields"
                        />
                    </div>
                <el-button
                    type="primary"
                    class="btn"
                    :style="buttonStyles"
                    @click="handleOtpVerfication()"
                    :disabled = "isLoading"
                    v-loading = "isLoading"
                >
                    Verify
                </el-button>
            </el-scrollbar>
        </el-dialog>
    </div>
</template>
  
<script >
import utils from '@/pages/siteSurvey/utils'
import API from '../../services/api/waareeAPI'

export default {

    props: {
        isOTPPopupVisible: {
            type: Boolean,
            default: false,
        },
        mobile : {
            type : String,
            required : true,
        },
        buttonStyles: {
            type: Object,
            default: () => ({}),
        },
        isEmailVerification: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            allIcon: utils.images,
            isLoading : false,
            otpValues: ['', '', '', ''],     
        };
    },

    computed: {
        visiblePopupp() {
            return this.$props.isOTPPopupVisible;
        },
    },

    methods: {
        handleClose() {
            this.$emit("close");
        },
        resetOTPFeild(){
            this.$refs.input1.value = null
            this.$refs.input2.value = null
            this.$refs.input3.value = null
            this.$refs.input4.value = null
        },
        handleInput(index, value) {
			if (value.length > 1) {
				return;
			}
			this.otpValues[index] = value;
			if (value.length === 1 && index < this.otpValues.length - 1) {
				this.$refs.otpFields[index + 1].focus();
			}
		},
		handleBackspace(index) {
			if (this.otpValues[index] !== '') {
				this.otpValues[index] = '';
			} else if (index > 0) {
				this.$refs.otpFields[index - 1].focus();
			}
		},
        async handleOtpVerfication(){
            const enteredOtp = this.otpValues[0] + this.otpValues[1] +
                            this.otpValues[2] + this.otpValues[3];

            const verificationType = this.isEmailVerification ? 'email' : 'phone';
            const email = this.isEmailVerification? this.mobile : '';
            const requestBody = {
                [verificationType]: this.isEmailVerification ? [email] : `+91${this.mobile}`,
                otp: Number(enteredOtp),
            };

            // const requestBody = {
            //     phone: `+91${this.mobile}`,
            //     otp:  Number(enteredOtp)
            // }
            
            try{
                this.isLoading = true;
                let response = await API.VERIFY_OTP(requestBody);
                if(response.status === 202){
                    this.$message({
                        showClose: true,
                        message: response?.data,
                        type: "success",
                        center: true
                    })
                    this.$emit('create-lead')
                    this.isLoading = false;
                }
            }catch(error){
                this.isLoading = false;
                if( error.response?.data === "OTP is wrong/expired"){
                    this.$message({
                        showClose: true,
                        message: "OTP is wrong/expired, Try again!",
                        type: "error",
                        center: true
                    })
                    this.resetOTPFeild()
                }else{
                    this.$message({
                        showClose: true,
                        message: error.message,
                        type: "error",
                        center: true
                    })
                }

                this.$emit('close');
                this.$emit('close-automate');
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

p,
h1,
h2,
h3,
h4,
h5,
h6,
input {
    font-family: "ceraPro";
}

.dialog {
    width: 498px !important;
    max-width: 498px !important;
    border-radius: 8px !important;
    margin-top: 20vh !important;
}


.otpParentContainer :deep() .el-dialog__header {
    display: flex !important;
    align-items: center;
    height: 40px;
    width: 100%;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    padding: 0px 24px;
    background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
}

.otpParentContainer :deep() .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    font-family: "ceraPro";
}

.otpParentContainer :deep() .el-dialog__headerbtn {
    top: -4px;
}

.otpParentContainer :deep() .el-dialog__headerbtn .el-dialog__close {
    color: #222;
    font-size: 24px;
    font-weight: 600;
}

.otpParentContainer :deep() .el-dialog__body {
    padding: 0px !important;
}


.otpParentContainer :deep() .el-scrollbar__wrap {
    overflow: auto;
    height: 100%;
    padding: 24px 24px 32px 24px;
    word-break: break-word;
    overflow: hidden;
    max-height: 670px;
    overflow-y: scroll;
    text-align: center;
}

.headings {
    color: #000;
    font-size: 20px;
    text-align: center;
}

.otpContainer {
    display: flex;
    justify-content: center;
    gap: 16px;
    align-items: center;
    margin: 40px auto 24px auto;
}

.otpInputs {
    width: 80px;
    font-size: 28px;
    font-weight: 500;
    border: none;
    outline: none;
    text-align: center;
    padding-bottom: 8px;
    border-bottom: 1.5px solid #000;
}

.otpInputs:focus {
	outline: none;
	border-bottom-color: #007bff;
}

.btn {
    height: 48px;
    width: 176px;
    font-size: 18px;
    font-weight: bold;
    color: #000;
    background-color: #ffdb27;
    border: none;
    margin: auto;
}

@media (max-width: 640px) {
    .otpParentContainer :deep() .el-dialog {
        width: 90vw !important;
        margin-top: 8vh !important;
    }

    .otpParentContainer :deep() .el-scrollbar__wrap {
        padding: 16px 16px 0px 16px;
        max-height: 70vh;
        margin-bottom: 16px;
    }

    .otpInputs {
        width: 50px;
    }
}</style>