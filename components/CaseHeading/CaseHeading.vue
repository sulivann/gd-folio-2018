<template>
  <div class="case-heading">
    <div class="case-heading__left-column">
      <div class="case-heading__element">
        <span class="case-heading__label">Role</span>
        <span class="case-heading__separator">/</span>
        <span class="case-heading__role">UI/UX - MOTION</span>
      </div>
      <div class="case-heading__element">
        <span class="case-heading__label">Agency</span>
        <span class="case-heading__separator">/</span>
        <span class="case-heading__role">Werkstatt</span>
      </div>
      <div class="case-heading__element">
        <span class="case-heading__label">Year</span>
        <span class="case-heading__separator">/</span>
        <span class="case-heading__role">2017</span>
      </div>
    </div>
    <div class="case-heading__right-column">
      <div class="case-heading__case-number">01 / 04</div>
    </div>
  </div>
</template>

<style lang="scss">
  @import './CaseHeading.scss';
</style>

<script>
  import { TweenMax } from 'gsap';
  export default {
    mounted: function() {
      TweenMax.to(this.$el, 1.5, {
        opacity: 1,
        ease: Sine.easeOut,
      });
    }
  }
</script>
