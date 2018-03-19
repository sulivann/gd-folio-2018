<template>
  <p class="case-description">
    {{description}}
  </p>
</template>

<style lang="scss">
  @import './CaseDescription.scss';
</style>

<script>
  import { TweenMax } from 'gsap';
  export default {
    props: ['description'],
    mounted: function() {
      TweenMax.to(this.$el, 0.7, {
        opacity: 1,
        ease: Sine.easeOut,
        delay: 0.4
      });
    }
  }
</script>
