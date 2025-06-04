<template>
    <div class="specificationContainer">
        <el-dialog v-model="visiblePopup" title="Specification" :close-on-click-modal="false" @close="handleClose"
            class="dialog">
            <div class="container">
                <div class="sidebar">
                    <p :class="['sidebarBtns', this.isProductSpecificationShow ? 'slidebarActiveBtn' : '']"
                        @click="isPrdtClick()">Product Specifications</p>
                    <p :class="['sidebarBtns', this.isSolarSpecificationShow ? 'slidebarActiveBtn' : '']"
                        @click="isSolarClick()">Solar Specifications</p>
                    <p :class="['sidebarBtns', this.isFeaturesShow ? 'slidebarActiveBtn' : '']" @click="isFeaturesClick()">
                        Features</p>
                </div>
                <el-scrollbar class="childContainer">
                    <div class="prdtSpc" v-if="isProductSpecificationShow">
                        <div class="flexCont">
                            <p class="headingPrdt">Brand</p>
                            <p class="valuePrdt">{{ specsData.string[0].manufactuerer }}</p>
                        </div>
                        <!-- <div class="flexCont">
                            <p class="headingPrdt">Phase Type</p>
                            <p class="valuePrdt">(TODO)</p>
                        </div> -->
                        <div class="flexCont">
                            <p class="headingPrdt">Rated Output Power (kW)</p>
                            <p class="valuePrdt">{{ specsData.string[0].electricalProperties.rated_output }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Maximum Efficiency</p>
                            <p class="valuePrdt">{{ specsData.string[0].electricalProperties.max_efficiency }}%</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Euro Efficiency</p>
                            <p class="valuePrdt">{{ specsData.string[0].electricalProperties.euro_efficiency }}%</p>
                        </div>
                        <!-- <div class="flexCont">
                            <p class="headingPrdt">Dimensions(L*W*H)</p>
                            <p class="valuePrdt">{{ specsData.string[0].electricalProperties.length }}mm x {{ specsData.string[0].electricalProperties.width }}mm x {{ specsData.string[0].electricalProperties.height }}mm</p>
                        </div> -->
                        <!-- <div class="flexCont">
                            <p class="headingPrdt">Weight</p>
                            <p class="valuePrdt">{{ specsData.string[0].electricalProperties.weight }}kg</p>
                        </div> -->
                        <!-- <div class="flexCont">
                            <p class="headingPrdt">Operating Temperature Range</p>
                            <p class="valuePrdt">
                                {{ specsData.string[0].electricalProperties.operating_temp_start }} °C to {{ specsData.string[0].electricalProperties.operating_temp_end }} °C
                            </p>
                        </div> -->
                        <!-- <div class="flexCont">
                            <p class="headingPrdt">Self Consumption at Night</p>
                            <p class="valuePrdt">&lt; (TODO) W</p>
                        </div> -->
                    </div>
                    <div class="solarSpc" v-if="isSolarSpecificationShow">
                        <div class="flexCont">
                            <p class="headingPrdt">Max. DC Capacity (Wp)</p>
                            <p class="valuePrdt">{{ specsData.string[0].electricalProperties.max_dc_capacity }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Max. Input Voltage (V)</p>
                            <p class="valuePrdt">{{ specsData.string[0].electricalProperties.max_input_voltage }}</p>
                        </div>
                        <!-- <div class="flexCont">
                            <p class="headingPrdt">DC Voltage Range</p>
                            <p class="valuePrdt">70V - 550V(TODO)</p>
                        </div> -->
                        <div class="flexCont">
                            <p class="headingPrdt">MPPT Voltage Range</p>
                            <p class="valuePrdt">
                                {{ specsData.string[0].electricalProperties.mppt_low }} - {{ specsData.string[0].electricalProperties.mppt_high }}
                            </p>
                        </div>
                    </div>
                    <div class="featuresCont" v-if="isFeaturesShow">
                        <p class="featuresHeading">Features</p>
                        <div class="featuresList">
                            <!-- hard coded -->
                            <!-- <p class="lists">Double MPPT tracker, MPPT tracking accuracy more than 99.5%(TODO)</p> -->
                            <p class="lists">Maximum efficiency of {{ specsData.string[0].electricalProperties.max_efficiency }}, European efficiency {{ specsData.string[0].electricalProperties.euro_efficiency }}</p>
                            <p class="lists">Transformerless design and high power density, offfer lighter and more
                                convenient installation</p>
                            <p class="lists">{{ specsData.string[0].product_warranty }}  standard warranty</p>
                            <p class="lists">Power factor continuously adjustable</p>
                            <p class="lists">Flexible communication connection, support RF,Wi-Fi, Ethernet</p>
                            <p class="lists">Comply with European, Australia, Asia-Pacific, safety regulations</p>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
        </el-dialog>
    </div>
</template>
  
<script >
export default {

    props: {
        isSpecificationPopupVisible: {
            type: Boolean,
            default: false,
        },
        specsData: {
            type: Object
        },
    },

    data() {
        return {
            isProductSpecificationShow: true,
            isSolarSpecificationShow: false,
            isFeaturesShow: false,
        };
    },

    computed: {
        visiblePopup() {
            return this.$props.isSpecificationPopupVisible;
        },
    },

    methods: {
        handleClose() {
            this.$emit("close");
        },

        isPrdtClick() {
            this.isProductSpecificationShow = true;
            this.isSolarSpecificationShow = false;
            this.isFeaturesShow = false;
        },

        isSolarClick() {
            this.isProductSpecificationShow = false;
            this.isSolarSpecificationShow = true;
            this.isFeaturesShow = false;
        },

        isFeaturesClick() {
            this.isProductSpecificationShow = false;
            this.isSolarSpecificationShow = false;
            this.isFeaturesShow = true;
        },
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

.specificationContainer :deep() .dialog {
    width: 80vw !important;
    border-radius: 8px !important;
    margin-top: 10vh !important;
}

.specificationContainer :deep() .el-dialog__header {
    display: flex !important;
    align-items: center;
    height: 40px;
    width: 100%;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    padding: 0px 24px;
    background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
}

.specificationContainer :deep() .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    font-family: "ceraPro";
}

.specificationContainer :deep() .el-dialog__headerbtn {
    top: -4px;
}

.specificationContainer :deep() .el-dialog__headerbtn .el-dialog__close {
    color: #222;
    font-size: 24px;
    font-weight: 600;
}

.specificationContainer :deep() .el-dialog__body {
    padding: 0px !important;
}


.specificationContainer :deep() .el-scrollbar__wrap {
    overflow: auto;
    height: 100%;
    padding: 24px 24px 32px 24px;
    word-break: break-word;
    overflow: hidden;
    max-height: 670px;
    overflow-y: scroll;
    text-align: center;
}

.container {
    display: grid;
    grid-template-columns: 241px auto;
}

.sidebar {
    border-right: 1px solid #ccc;
}

.sidebarBtns {
    display: flex;
    align-items: center;
    padding-left: 24px;
    width: 100%;
    height: 56px;
    font-size: 18px;
    font-weight: 500;
    color: #777;
    border-bottom: 1px solid #ccc;
    cursor: pointer;
}

.slidebarActiveBtn {
    background-color: #0db02b;
    color: #fff;
}

.childContainer {
    height: 75vh;
    padding: 8px 24px 24px 32px;
    overflow: hidden;
    overflow-y: scroll;
}

.specificationContainer>>>.el-scrollbar__wrap {
    padding: 0px;
}

.childContainer::-webkit-scrollbar {
    width: 8px;
}

.flexCont {
    display: grid;
    grid-template-columns: 300px auto;
    gap: 24px;
    align-items: flex-start;
    text-align: left;
    padding: 15px 0px;
    min-height: 55px;
    border-bottom: 1px solid #ccc;
}

.headingPrdt {
    font-size: 20px;
    color: #777;
}

.valuePrdt {
    font-size: 20px;
    color: #000;
}

.featuresHeading {
    font-size: 20px;
    font-weight: 500;
    color: #777;
    text-align: left;
    margin-bottom: 16px;
    margin-top: 16px;
}

.featuresList {
    text-align: left;
}

.lists {
    font-size: 20px;
    color: #000;
    margin-bottom: 24px;
    display: grid;
    grid-template-columns: 10px auto;
    align-items: flex-start;
    gap: 16px;
}

.lists::before {
    content: '';
    height: 8px;
    width: 8px;
    background-color: #000;
    border-radius: 50%;
    display: inline-block;
    margin-top: 9px;

}

@media (max-width: 1150px) {
    .specificationContainer :deep() .el-dialog {
        width: 90vw !important;
        margin-top: 8vh !important;
    }
    .container {
        grid-template-columns: 200px auto;
    }

    .sidebarBtns {
        padding-left: 12px;
    }

    .childContainer {
        padding: 8px 16px 24px 16px;
    }

    .headingPrdt,
    .valuePrdt,
    .sidebarBtns {
        font-size: 16px;
    }

    .flexCont {
        grid-template-columns: 220px auto;
        padding: 12px 0px;
        min-height: 48px;
    }

    .lists {
        font-size: 16px;
        margin-bottom: 16px;
        line-height: 1.5;
    }

    .lists::before {
        width: 6px;
        height: 6px;
    }

}




@media (max-width: 650px) {
    .sidebar {
        display: flex;
        align-items: flex-start;
    }

    .sidebarBtns {
        font-size: 14px;
    }

    .sidebarBtns:nth-child(2) {
        border: 1px solid #ccc;
        border-top: none;
    }
    

    .container {
        grid-template-columns: 1fr;
    }

    .flexCont {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    .childContainer {
        padding: 8px 0px 24px 16px;
    }

}
</style>