<template>
  <div class="case-video" v-scroll="handleFadeIn">
    <video
      autoplay
      muted
      v-on:click="handleVideoClick">
      <template v-for="(source, index) in sources">
        <source
          :key="index"
          :src="`/videos/${source.src}`"
          :type="source.type">
      </template>
      Votre navigateur ne permet pas de lire les vidéos HTML5.
    </video>
  </div>
</template>

<style lang="scss">
  @import './CaseVideo.scss';
</style>

<script>
import { TweenMax } from 'gsap';

export default {
  props: ['sources'],
  methods: {
    handleVideoClick (event) {
      if (event.target.paused) {
        event.target.play();
      } else {
        event.target.pause();
      }
    },
    handleFadeIn: function(evt, el) {
      if (((el.getBoundingClientRect().top - window.innerHeight) < -130) && !el.classList.contains('js--already-animated')) {
        // Start video on waypoint
        const videos = el.getElementsByTagName('video');
        videos[0].play();
        // Add new class on waypoint
        el.classList.add('js--already-animated');
        TweenMax.to(el, 0.7, {
          opacity: 1,
          ease: Sine.easeOut
        });
      }
    }
  },
}
</script>
