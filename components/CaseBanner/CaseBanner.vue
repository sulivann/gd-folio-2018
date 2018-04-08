<template>
  <div class="case-banner">
    <img class="case-banner__img" :src="`/img/${banner.src}`" />
  </div>
</template>

<style lang="scss">
  @import './CaseBanner.scss';
</style>

<script>
  export default {
    props: ['banner']
  }
</script>
