<template>
  <div class="case-heading">
    <div class="case-heading__element">
      <span class="case-heading__role">{{projectNumber}}</span>
    </div>
    <div class="case-heading__element">
      <span class="case-heading__role">{{role}}</span>
    </div>
    <div class="case-heading__element">
      <span class="case-heading__role">{{year}}</span>
    </div>
    <div class="case-heading__element">
      <span class="case-heading__role">{{context}}</span>
    </div>
  </div>
</template>

<style lang="scss">
  @import './CaseHeading.scss';
</style>

<script>
  import { TweenMax } from 'gsap';
  export default {
    props: ['role', 'contextLabel', 'context', 'year', 'projectNumber'],
    mounted: function() {
      TweenMax.to(this.$el, 0.7, {
        opacity: 1,
        ease: Sine.easeOut,
      });
    }
  }
</script>
