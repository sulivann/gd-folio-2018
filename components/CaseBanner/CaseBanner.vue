<template>
  <div class="case-banner">
    <div class="case-banner__container" v-scroll="handleParallax">
      <img class="case-banner__img" src="~assets/img/banner_badass.png" />
    </div>
    <img class="case-banner__logo" src="~assets/img/badass.svg" />
  </div>
</template>

<style lang="scss">
  @import './CaseBanner.scss';
</style>

<script>
  import { TweenMax } from 'gsap';
  import Scrollbar from 'smooth-scrollbar';

  export default {
    mounted: function() {
      TweenMax.to(this.$el, 1.5, {
        opacity: 1,
        ease: Sine.easeOut,
        delay: 0.8
      });

      this.handleParallax(null, this.$el);
    },
    methods: {
      handleParallax: function(evt, el) {
        const scrollbars = Scrollbar.getAll();
        let distance = Math.abs(scrollbars[0].scrollTop) * 0.1;
        el.style.transform = `translate3d(0, -${distance}px, 0)`;
      }
    }
  }
</script>
