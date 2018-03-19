<template>
  <h1 class="case-headline">
    {{title}}
  </h1>
</template>

<style lang="scss">
  @import './CaseHeadline.scss';
</style>

<script>
export default {
  props: ['title'],
};
</script>
