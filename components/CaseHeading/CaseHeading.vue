<template>
  <div class="case-heading">
    <div class="case-heading__left-column">
      <div class="case-heading__element">
        <span class="case-heading__label">Role</span>
        <span class="case-heading__separator">/</span>
        <span class="case-heading__role">{{role}}</span>
      </div>
      <div class="case-heading__element">
        <span class="case-heading__label" v-if="contextLabel">{{contextLabel}}</span>
        <span class="case-heading__separator" v-if="contextLabel">/</span>
        <span class="case-heading__role">{{context}}</span>
      </div>
      <div class="case-heading__element">
        <span class="case-heading__label">Year</span>
        <span class="case-heading__separator">/</span>
        <span class="case-heading__role">{{year}}</span>
      </div>
    </div>
    <div class="case-heading__right-column">
      <div class="case-heading__case-number">{{projectNumber}}</div>
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
