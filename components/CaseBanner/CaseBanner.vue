<template>
  <div class="case-banner">
    <parallax :speedFactor="0.1">
      <img class="case-banner__img" src="~assets/img/banner_badass.png" />
    </parallax>
    <img class="case-banner__logo" src="~assets/img/badass.svg" />
  </div>
</template>

<style lang="scss">
  @import './CaseBanner.scss';
</style>

<script>
  import Parallax from 'vue-parallaxy'
  export default {
    components: {
      Parallax
    }
  }
</script>
