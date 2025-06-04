<template>
    <div class="outer-container">
        <div class="instruction-container" id="intro">
            <span class="intro-span">Introduction</span>
            <div>
                <div v-for="instruction in instructions" class="instruction-item">
                    {{ instruction }}
                </div>
            </div>
            <div class="bottom-container">
                <el-checkbox :class="['bottom-cb', checkBox ? '' : 'border-cb']" v-model="checkBox" label="I understand the instructions and consent to my data being used for my solar quote." size="large" />
                <el-button class="bottom-btn" :disabled="!checkBox" type="primary" @click="handleClick">Get Started</el-button>
            </div>
        </div>
    </div>
</template>


<script>
import API from '@/services/api';

export default {
    name: "instructionsPage",
    components: {
    },
    created(){
    },
    data(){
        return{
            JSONDATA: "1. The site survey has several steps and all the step are required to be responded to complete the site survey form.\n2. You have to search and select the google map image of the ground you wish to have solar on and fill in the required details.\n3. After selecting the map image you have to upload photos of the ground.\n4. Complete the site survey without closing the browser/tab. Closing the tab or browser window may cause the loss of the captured images and videos.",
            checkBox: false,
        }
    },
    mounted(){
    },
    computed:{
        instructions(){
            return this.JSONDATA.split('\n') || ['']
        }
    },
    methods:{
        handleClick(){
            localStorage.setItem('instructionGuide', true)
            this.$emit('accepted')
        }
    },
    

}
</script>

<style scoped>
.outer-container{
    font-size: 18px;
    font-weight: 400;
    height: 100vh;
    background-color: #E8EDF2;
    padding: 70px 0;
    display: flex;
    justify-content: center;
}
.instruction-container{
    background-color: white;
    padding: 36px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    min-width: 80vw;
}
.instruction-item{
    padding: 24px;
    min-height: 72px;
}
.instruction-item:nth-child(odd){
    background-color: #E8EDF2;
}
.bottom-container{
    margin-top: auto;
    display: flex;
    padding-left: 4px;
    align-items: end;
    margin-bottom: 8px;
}
.bottom-btn{
    margin-left: auto;
}
.bottom-container >>> span, .bottom-btn{
    font-size: 18px !important;
    font-weight: 400;
}
.bottom-container >>> .el-checkbox{
    color: #222222;
}
.border-cb >>> .el-checkbox__inner{
    border-top: 1px solid grey;
    border-left: 1px solid grey;
}
.bottom-container >>> button{
    width: 140px;
    height: 50px;
}
.intro-span{
    color: #1C3366;
    margin-bottom: 30px;
}
.bottom-container >>> .el-checkbox__label{
    color: black !important;
}
@media (max-width: 924px){
    .outer-container{
        padding: 0;
    }
    .instruction-container{
        padding: 20px;
        padding-bottom: 80px;
        overflow-x: hidden;
    }
    .intro-span{
        font-size: 20px;
        font-weight: 600;
    }
    .bottom-container{
        flex-direction: column;
        margin-bottom: 50px;
    }
    .bottom-container .el-checkbox{
        display: flex;
        white-space: break-spaces;
        align-items: start;
        width: 100vw;
        position: absolute;
        bottom: 50px;
        right: 0;
        padding: 20px;
        box-shadow: 0px -5px 10px 0px #00000040;
        height: 80px;
        background-color: white;
    }
    .bottom-container >>> .el-checkbox__label{
        position: relative;
        bottom: 3px;
    }
    .bottom-container >>> button{
        position: absolute;
        width: 100vw;
        border-radius: 0;
        bottom: 0;
        right: 0;
    }
    .bottom-btn >>> span{
        font-size: 20px !important;
        font-weight: 600;
    }
}
</style>