<template>
  <div class="case-text" v-scroll="handleFadeIn">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse convallis nibh sapien, id bibendum dolor eleifend et. Fusce faucibus mollis magna, nec dignissim mauris mollis quis. Morbi vel sapien ut leo vestibulum consectetur non non nibh. Donec ut elementum odio, finibus rutrum mi.</p>
  </div>
</template>

<style lang="scss">
  @import './CaseText.scss';
</style>

<script>
  import { TweenMax } from 'gsap';

  export default {
    methods: {
      handleFadeIn: function(evt, el) {
        if (((el.getBoundingClientRect().top - window.innerHeight) < -130) && !el.classList.contains('js--already-animated')) {
          // Add new class on waypoint
          el.classList.add('js--already-animated');
          TweenMax.to(el, 1.5, {
            opacity: 1,
            ease: Sine.easeOut
          });
        }
      }
    }
  }
</script>
