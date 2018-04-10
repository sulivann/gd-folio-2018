<template>
  <div class="case-banner" v-bind:style="{backgroundImage: `url(/img/${banner.light})`}">
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
