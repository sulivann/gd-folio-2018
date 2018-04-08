<template>
  <div class="case-text" v-scroll="handleFadeIn">
    <p>{{text}}</p>
  </div>
</template>

<style lang="scss">
  @import './CaseText.scss';
</style>

<script>
  import { TweenMax } from 'gsap';

  export default {
    props: ['text'],
    methods: {
      handleFadeIn: function(evt, el) {
        if (((el.getBoundingClientRect().top - window.innerHeight) < -130) && !el.classList.contains('js--already-animated')) {
          // Add new class on waypoint
          el.classList.add('js--already-animated');
          // TweenMax.to(el, 0.2, {
          //   opacity: 1,
          //   y: '-=1',
          //   ease: Sine.easeOut
          // });
        }
      }
    }
  }
</script>
