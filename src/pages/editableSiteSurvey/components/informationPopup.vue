<template>
    <div class="headerSection">
       
    </div>
</template>
<script>

export default ({
    name: "informationPopup",
  
 })
</script>

<style scoped>
.toggle {
    display: inherit;
    margin: auto;
    cursor: pointer;
    filter: invert(1);
    height: 25px;
}
.toggleInvert {
    transform: rotate(180deg);
}
.info-section{
    padding: 8px 0px 30px 19px;
    display: flex;
    /* width: 50%; */
    gap: 10px;
    white-space: break-spaces;
    flex-direction: column;
}

.card-cont{
    margin-left: 0px;
    height: auto;
    padding: 8px 0px 0px 0px;
    background-color: #fff;
    border-radius: 16px;
    position: fixed;
    bottom: 0px;
    width: 100%;
    left: 0px;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
    max-width: inherit;
    z-index: 1212;
    max-height: 330px;
    overflow-y: scroll;
    transition: all 2s ease;
}
</style>
