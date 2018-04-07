<template>
    <div class="project-subtitle">{{ projectSubtitleContent }}</div>
</template>

<style lang="scss">
  @import './HomeSubtitle.scss';
</style>

<script>
import { TweenMax, Power2 } from 'gsap';

  export default {
    props: ['role'],
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
    watch: { role: 'subtitleUpdate' },
    methods: {
      init() {
        this.projectSubtitle = document.querySelector('.project-subtitle');
        this.projectSubtitleContent = this.role;
        if (this.$store.getters.mobileLayout || this.$store.getters.homeBeenHovered) this.subtitleFadeIn();
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
          if (mutation.type === 'SET_MOBILELAYOUT' && state.mobileLayout === true) {
            this.subtitleFadeIn();
          } else if (mutation.type === 'SET_MOBILELAYOUT' && state.mobileLayout === false && !state.homeBeenHovered) {
            this.subtitleFadeOut();
          }
        })
      },

      subtitleUpdate() {
          this.subtitleFadeOut();
          if (this.$store.getters.homeBeenHovered){
            setTimeout(() => {
              this.subtitleFadeIn();
              }, 700);
          }
      },

      subtitleFadeIn() {
        TweenMax.to(this.projectSubtitle, 0.8, {
            opacity: 1,
            delay: 0.5,
            ease: Power2.easeOut
        });
      },

      subtitleFadeOut() {
        TweenMax.to(this.projectSubtitle, 0.4, {
            opacity: 0,
            ease: Power2.easeOut,
            delay: 0.3,
            onComplete: () => this.projectSubtitleContent = this.role,
        });
      }
    }
}
</script>
