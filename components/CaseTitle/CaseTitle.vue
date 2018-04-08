<template>
  <div class="case-title">
    <h1 class="case-title__text">{{title}}</h1>
  </div>
</template>

<style lang="scss">
  @import './CaseTitle.scss';
</style>

<script>
  export default {
    props: ['title']
  }
</script>
