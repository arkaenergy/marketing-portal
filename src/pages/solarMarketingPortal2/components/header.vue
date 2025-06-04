<template>
    <div class="headingFlex">
        <p class="heading">{{ heading }}</p>
        <div class="buttonsContainer">
            <button class="resetBtn" @click="$emit('reset')" >Reset</button>
            <el-button :loading="isButtonLoading" class="downloadBtn" v-if="pageNo==3" @click="redirectToReport">Download Report</el-button>
        </div>

    </div>
</template>

<script>
import API from '@/services/api';
import { SAVE_REPORT_LAMBDA_ENDPOINT } from '../../../constants';
import { v4 } from 'uuid';

export default {
    components: {

    },
    created() {

    },
    props:{
        pageNo:{
            type: Number,
            default:2,
        },
        heading:{
            type: String,
        },
        extraInfoForSolarkReport:{
            type: Object
        }
    },
    data() {
        return {
            "userInfo": JSON.parse(localStorage.getItem('userInfo')),
            isButtonLoading:false,
        }
    },
    methods: {
        async redirectToReport(){
            this.isButtonLoading = true;
            let data = JSON.parse(localStorage.getItem("jsonToSendForCalculation"));
            data.solark_report_additional_data = {
                ... this.extraInfoForSolarkReport
            }
            localStorage.setItem(
                "jsonToSendForCalculation",
                JSON.stringify(data)
            );
            let postData = {
                "email": this.userInfo?.emailId,
                "name": this.userInfo?.name,
                "mobileNo": this.userInfo?.mobileNo,
                "type_of_user": data.typeOfUser,
                "report_json": {... data}
            } 
            await API.SOLARK.CREATE_OR_PATCH_SOLARK_REPORT(postData);
            this.downloadReport();
            // const email = this.userInfo.emailId;
            // this.$router.push({ path: '/solarkReport', query: { email } });
            // this.$router.push({name:'solarkReportDynamic', params:{email: this.userInfo.emailId}});
        },
        async downloadReport(){
            let referenceId = v4();
            const email = this.userInfo.emailId;
            const route = { name: "solarkReport", query: { email } };
            let url = this.$router.resolve(route).href;
            url = "https://" + window.location.host + url;
            // url = "https://devgosolar.thesolarlabs.com/solarkReport?email=sanchitagrawal429@gmail.com"
            let payload = {
                "reference_id": referenceId,
                "base_url": url,
                "scale": 1,
                "landscape": false,
                "is_solark": true,
            }
            try{
                let response = await fetch(SAVE_REPORT_LAMBDA_ENDPOINT, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                })
                let respText = await response.text();
                if (!response.ok) {
                    throw respText
                }
                let reportUrl = respText;
                this.downloadFileHelper(reportUrl, ".pdf");
                this.isButtonLoading = false;
            }
            catch(e){
                console.error(e);
                this.isButtonLoading = false;
                ElMessage({
                    showClose: true,
                    message: "Error downloading report. Please try again.",
                    type: "error",
                    center: true
                });
            }
        },
        downloadFileHelper(url, extension) {
            const link = document.createElement("a");
            link.href = url;
            link.target = "_blank";
            link.setAttribute("download", this.designId + extension); // or any other extension
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
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
a {
    font-family: 'Poppins';
}

.headingFlex {
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid #00101A;
    padding: 8px 0px 13px 0px;
}

.heading {
    font-size: 36px;
    font-weight: bold;
    color: #00101A;
}
.buttonsContainer{
    display: flex;
    justify-content: space-between;
    flex: 1;
}
.resetBtn {
    width: 105px;
    height: 44px;
    border-radius: 4px;
    background-color: #fff;
    font-size: 20px;
    font-weight: bold;
    color: #F7921E;
    border: none;
    cursor: pointer;
    border: 1px solid #F7921E;
}
.downloadBtn{
    width: 200px;
    height: 44px;
    border-radius: 4px;
    background-color: #F7921E;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    border: none;
    cursor: pointer;
}

@media (max-width: 1000px) {
    .heading {
        font-size: 24px;
    }
}
</style>