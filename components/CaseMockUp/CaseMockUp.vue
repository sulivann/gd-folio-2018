<template>
  <div class="case-mock-up" v-scroll="handleFadeIn">
    <img class="case-mock-up__img" :src="`/img/${src}`">
  </div>
</template>

<style lang="scss">
  @import './CaseMockUp.scss';
</style>

<script>
  import { TweenMax } from 'gsap';

  export default {
    props: ['src'],
    methods: {
      handleFadeIn: function(evt, el) {
        if (((el.getBoundingClientRect().top - window.innerHeight) < -130) && !el.classList.contains('js--already-animated')) {
          // Add new class on waypoint
          el.classList.add('js--already-animated');
          TweenMax.to(el, 0.7, {
            opacity: 1,
            ease: Sine.easeOut
          });
        }
      }
    }
  }
</script>
