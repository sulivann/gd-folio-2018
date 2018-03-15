<template>
  <div class="case-video">
    <video
      autoplay
      muted
      v-on:click="handleVideoClick">
      <source
        src="~assets/videos/yaeji.mp4"
        type="video/mp4">
      Votre navigateur ne permet pas de lire les vidéos HTML5.
    </video>
  </div>
</template>

<style lang="scss">
  @import './CaseVideo.scss';
</style>

<script>
export default {
  methods: {
    handleVideoClick (event) {
      if (event.target.paused) {
        event.target.play();
      } else {
        event.target.pause();
      }
    }
  },
}
</script>
