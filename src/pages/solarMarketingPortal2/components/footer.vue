<template>
    <div class="footer">
        <div class="footerFlex">
            <p class="footerLine">> Disclaimer : This is a preliminary estimate based on input provided through this form.
                Please consult with Sol-ark or a Sol-ark affiliated installer for a final recommendation.
            </p>
            <div class="flexFooterBtn">
                <el-button class="footerBackBtn" @click="backStep()" v-if="pageNo>1">BACK</el-button>
                <el-button class="footerNextBtn" @click="nextStep()"  v-if="pageNo<3" :loading="loadingStateButton">NEXT</el-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    components: {
        
    },
    props:{
        pageNo:{
            type: Number,
            default:1,
        },
        contentsFromPage1ForValidation:{
            type: Object,
            default:{},
        },
        dataFromPage1ForSavingInLS:{
            type: Object,
            default:{},
        },
        contentsFromPage2ForValidation:{
            type: Object,
            default:{},
        }
    },
    created() {

    },
    data() {
        return {
            showBackBtn: true,
            loadingStateButton: false,
        }
    },
    methods: {
        nextStep(){
            if(this.pageNo==1){
                let obj = {...this.contentsFromPage1ForValidation}
                if((obj.isTypeOfUserInOtherCategory && !obj.typeOfUser) || !obj.address){
                    this.$emit("triggerValidation");
                    return;
                }
                this.saveInputDatasInLS(this.pageNo);
            }
            else if(this.pageNo==2){
                let obj = {... this.contentsFromPage2ForValidation}
                if(obj.avgMontlyEngConsump<=0 || obj.hoursOfBackup<=0){
                    return;
                }
                else if(JSON.parse(localStorage.getItem("userInfo"))) {
                    this.$emit("pageNumberAfterNext",this.pageNo+1);
                }
                else{
                    this.$emit("showLeadDetailsPopup");
                    return;
                }
            }
            this.$emit("pageNumberAfterNext",this.pageNo+1);
        },
        backStep(){
            if(this.pageNo>1)
                this.$emit("pageNumberAfterBack",this.pageNo-1);
        },
        saveInputDatasInLS(pageNo){
            if(pageNo==1){
                let dataObj = this.dataFromPage1ForSavingInLS;
                console.log("incoming data from page1",this.dataFromPage1ForSavingInLS);
                let dataFromLS = JSON.parse(localStorage.getItem('jsonToSendForCalculation'))
                dataFromLS['center'] = {... dataObj['center']}
                dataFromLS['typeOfUser'] =  dataObj['typeOfUser']
                dataFromLS['zoom'] =  dataObj['zoom']
                dataFromLS['otherUserValue'] =  dataObj['otherUserValue']
                dataFromLS['avgMonthlyBill'] =  dataObj['avgMonthlyBill']
                dataFromLS['state'] = dataObj['state'];
                dataFromLS['address'] = dataObj['address'];
                localStorage.setItem("jsonToSendForCalculation",JSON.stringify(dataFromLS));
            }
        }
    },
    computed: {

    },
    watch: {

    }
}
</script>

<style scoped>
.footer {
    position: fixed;
    bottom: 0px;
    min-height: 94px;
    width: 100%;
    background-color: #fff;
    z-index: 2;
    margin-left: -32px;
}

.footerFlex {
    margin: auto 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 40px;
    border-top: 1px solid #BFBFBF;
}

.flexFooterBtn {
    margin-top: 12.5px;
    display: flex;
    gap: 12px;
}

.footerNextBtn,
.footerBackBtn {
    width: 128px;
    height: 44px;
    border-radius: 4px;
    background-color: #F7921E;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    border: none;
}

.footerBackBtn {
    background-color: #fff;
    color: #F7921E;
    border: 1px solid #F7921E;
}

.footerLine {
    font-size: 14px;
    color: #000;
    line-height: 1.38;
    padding-top: 16px;
}
</style>