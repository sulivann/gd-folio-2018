<template>
  <div class="case-banner">
    <div class="case-banner__container" v-scroll="handleParallax">
      <img class="case-banner__img" :src="`/img/${banner.src}`" />
    </div>
    <img class="case-banner__logo" :src="`/img/${banner.logoSrc}`" />
  </div>
</template>

<style lang="scss">
  @import './CaseBanner.scss';
</style>

<script>
  import { TweenMax } from 'gsap';
  import Scrollbar from 'smooth-scrollbar';

  export default {
    props: ['banner'],
    mounted: function() {
      TweenMax.to(this.$el, 0.7, {
        opacity: 1,
        ease: Sine.easeOut,
        delay: 0.8
      });
      const scrollbars = Scrollbar.getAll();
      if (scrollbars.length > 0) scrollbars[0].scrollTop = 0;
      this.handleParallax(null, this.$el);
    },
    methods: {
      handleParallax: function(evt, el) {
        const scrollbars = Scrollbar.getAll();
        if (scrollbars.length > 0) {
          let distance = Math.abs(scrollbars[0].scrollTop) * 0.1;
        }
      }
    }
  }
</script>
