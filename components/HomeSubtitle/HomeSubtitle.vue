<template>
    <div class="project-subtitle">{{ projectSubtitleContent }}</div>
</template>

<style lang="scss">
  @import './HomeSubtitle.scss';
</style>

<script>
import { TweenMax, Power2 } from 'gsap';

  export default {
    props: ['projects'],
    data() {
      return {
        projectSubtitle: '',
        projectSubtitleContent: '',
        tl: new TimelineMax(),
      }
    },
    components: {
    },
    mounted() {
      this.init();
    },
    methods: {
      init() {
        this.projectSubtitle = document.querySelector('.project-subtitle');
        this.projectSubtitleContent = this.projects[this.$store.state.activeIndex].homeSubtitle;
        if (this.$store.getters.homeBeenHovered){
          this.subtitleFadeIn();
        }
        let suscribe = this.$store.subscribe((mutation, state) => {
          if (mutation.type === 'SET_ACTIVEINDEX' && this.$store.state.homeBeenHovered === true) {
            this.subtitleUpdate();
          }
          if (mutation.type === 'SET_HOMEHOVER') {
            this.subtitleFadeIn();
          }
        })
      },

      subtitleUpdate() {
          this.subtitleFadeOut();
          if (this.$store.getters.homeBeenHovered){
            setTimeout(() => {
              this.subtitleFadeIn();
              }, 500);
          }
      },

      subtitleFadeIn() {
        TweenMax.to(this.projectSubtitle, 0.3, {
            opacity: 1,
            ease: Power3.easeOut
        });
      },

      subtitleFadeOut() {
        TweenMax.to(this.projectSubtitle, 0.3, {
            opacity: 0,
            ease: Power3.easeOut,
            onComplete: () => this.projectSubtitle.innerHTML = this.projects[this.$store.state.activeIndex].homeSubtitle
        });
      }
    }
}
</script>
