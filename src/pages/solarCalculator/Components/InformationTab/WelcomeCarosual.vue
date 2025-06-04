<template>
    <div  class="carousal-container">
        <el-carousel  :interval="5000" class="hide-arrows ">
    <el-carousel-item v-for="item in carsoualData" :key="item" >
      <img  :src="item" alt="" style="width:100%;height:100%">
    </el-carousel-item>
  </el-carousel>
    </div>
</template>

<script>
import img1 from '../../assets/carsoulimgs/image1.jpg';
import img2 from '../../assets/carsoulimgs/image2.jpg';
import img3 from '../../assets/carsoulimgs/image3.jpg';
import { ref } from 'vue';
export default {
    setup () {  
        const carsoualData= ref([img1,img2,img3]);
        return {carsoualData}
    }
}
</script>

<style scoped>
.el-carousel__item h3 {
    color: #475669;
    font-size: 18px;
    opacity: 0.75;
    line-height: 300px;
    margin: 0;
  }
  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }
  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
  .carousal-container>>> .el-carousel__container{
      height:90vh !important;
    }

  @media screen and (max-width: 1180px) and (min-width: 375px) {
    .carousal-container>>> .el-carousel__container{
      height:300px !important;

    }
  }

  @media screen and (max-width: 740px) and (min-width: 360px) {
    .carousal-container>>>  .el-carousel__container{
      height:200px !important;

    }
  }

</style>