<template>
    <div class="imgCont">
        <img v-if="title=='Inverter'" src="../assets/inverterBig.svg" class="img">
        <img v-else src="../assets/battery.png" class="img">

        <div class="imgContent">
            <div>
                <p class="headingImg">{{ title }}</p>
                <p class="valImg">{{ name }} </p>
            </div>
            <p class="specSheet" @click="downloadFile">View Spec Sheet</p>
        </div>
    </div>
</template>

<script>
import { saveAs } from 'file-saver';

export default {
    components: {
    },
    props: {
        title:{
            type: String
        },
        name:{
            type:String
        },
        url:{
            type:String
        }
    },
    data() {
        return {
            showBackBtn: false,
            loadingStateButton: false,
            inverterImage:"../assets/inverterBig.svg"
        }
    },
    methods: {
        downloadFile(){
            let fileUrl = this.url;
            let splitArray = fileUrl.split('?')[0].split('/')
            let fileName = splitArray[splitArray.length - 1]
            saveAs(fileUrl, fileName)
        }
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
a,
input {
    font-family: 'Poppins';
}

.imgCont {
    width: 100%;
    border-radius: 8px;
    background-color: #fff;
    padding: 24px;
    display: flex;
    gap: 24px;
    align-items: flex-start;
    border: 1px solid #cccccc;
    border-left: 8px solid #f7941d;
    max-width: 438px;
}

.img {
    max-width: 112px;
}

.imgContent {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
    height: 100%;
}

.inverter-container {
    height: 100%;
    display: flex;
}

.info-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

}

.main-info-container {
    display: flex;
    flex-direction: column;
    gap: 100px;
}

.specSheet {
    color: #006aa9;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
}

.headingImg {
    font-size: 20px;
    font-weight: 600;
    color: #222;
    margin-bottom: 5px;
}

.valImg {
    font-size: 16px;
    color: #222;
}

@media (max-width: 1300px) {
    .imgCont {
        max-width: 100%;
    }
}

</style>
