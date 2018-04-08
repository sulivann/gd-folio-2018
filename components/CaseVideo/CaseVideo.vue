<template>
  <div class="case-video" v-scroll="handleFadeIn">
    <video
      autoplay
      loop
      muted
      ref="video"
      v-on:click="handleVideoClick">
      <template v-for="(source, index) in sources">
        <source
          :key="index"
          :src="`/videos/${source.src}`"
          :type="source.type">
      </template>
      Votre navigateur ne permet pas de lire les vidéos HTML5.
    </video>
    <div class="case-video__control" v-if="paused" v-on:click="handleVideoClick">
      Play
    </div>
  </div>
</template>

<style lang="scss">
  @import './CaseVideo.scss';
</style>

<script>
import { TweenMax } from 'gsap';

export default {
  data() {
    return {
      paused: false
    }
  },
  props: ['sources'],
  methods: {
    handleVideoClick () {
      if (this.$refs.video.paused) {
        this.$refs.video.play();
        this.paused = false;
      } else {
        this.$refs.video.pause();
        this.paused = true;
      }
    },
    handleFadeIn: function(evt, el) {
      if (((el.getBoundingClientRect().top - window.innerHeight) < -130) && !el.classList.contains('js--already-animated')) {
        // Start video on waypoint
        const videos = el.getElementsByTagName('video');
        // videos[0].play();
        // Add new class on waypoint
        el.classList.add('js--already-animated');
        // TweenMax.to(el, 0.2, {
        //   opacity: 1,
        //   y: '-=1',
        //   ease: Power2.easeOut
        // });
      }
    }
  }
}
</script>
