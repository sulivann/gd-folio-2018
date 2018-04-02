<template>
  <div class="home-images">
    <div class="home-project__images-container">
      <img class="home-project__image" :src="`/img/${projectImgSource}`" alt="">
      <img class="home-project__image" :src="`/img/${projectImgSource}`" alt="">
      <img class="home-project__image" :src="`/img/${projectImgSource}`" alt="">
      <img class="home-project__image" :src="`/img/${projectImgSource}`" alt="">
    </div>
  </div>
</template>

<style lang="scss">
  @import './HomeImages.scss';
</style>

<script>
import { TweenMax, Power2 } from 'gsap';

  export default {
    props: [
      'img',
      'mouse',
      'viewport'
    ],
    data() {
      return {
        projectImages: '',
        projectImgSource: '',
        tl: new TimelineMax(),
      }
    },
    components: {
    },
    created() {
      this.$parent.$on('mousemove', this.moveImages);
    },
    mounted() {
      this.init();
    },
    methods: {
      init() {
        this.projectImages = document.querySelectorAll('.home-project__image');
        this.projectImgSource = this.img;
        if (this.$store.getters.homeBeenHovered || this.$store.getters.mobileLayout) this.imgFadeIn();
        let suscribe = this.$store.subscribe((mutation, state) => {
          if (mutation.type === 'SET_ACTIVEINDEX') {
            this.imgUpdate();
          }
          if (mutation.type === 'SET_HOMEHOVER') {
            this.imgFadeIn();
          }
          if (mutation.type === 'SET_MOBILELAYOUT' && state.mobileLayout === true) {
            this.imgFadeIn();
          } else if (mutation.type === 'SET_MOBILELAYOUT' && state.mobileLayout === false && !state.homeBeenHovered) {
            this.imgFadeOut();
          }
        })
      },
      imgUpdate() {
          this.imgFadeOut();
          if(this.$store.getters.homeBeenHovered){
            setTimeout(() => {
              this.imgFadeIn();
            }, 1000);
          }
      },

      imgFadeIn() {
        TweenMax.staggerTo(this.projectImages, 0.2, {
            opacity: 1,
            ease: Power3.easeOut
        }, 0.05);
      },

      imgFadeOut() {
        TweenMax.staggerTo(this.projectImages, 0.2, {
            opacity: 0,
            ease: Power3.easeOut,
        }, 0.05,
        this.updateImgsURL
        );
      },

      updateImgsURL() {
        this.projectImgSource = this.img;
      },

      moveImages(mouse) {
        TweenMax.staggerTo([this.projectImages[1],this.projectImages[2], this.projectImages[3]], 0.01, {
          rotationY: -(10 - 20 * (mouse.posX / this.viewport.w)),
          rotationX: (10 - 20 * (mouse.posY / this.viewport.h)),
          x: '-50%',
          y: '-50%',
        }, 0.06);
      },
   },
}
</script>
