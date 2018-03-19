<template>
  <p class="case-description">
    I had the opportunity during my internship at Werkstatt to work along other great designers on the website of Badass. A production films company, with great names. The main goal was to craft a smooth experience to get through all the directors' works without switching or loading pages.
  </p>
</template>

<style lang="scss">
  @import './CaseDescription.scss';
</style>

<script>
  import { TweenMax } from 'gsap';
  export default {
    mounted: function() {
      TweenMax.to(this.$el, 1.5, {
        opacity: 1,
        ease: Sine.easeOut,
        delay: 0.4
      });
    }
  }
</script>
