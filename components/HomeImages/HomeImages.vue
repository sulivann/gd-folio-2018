<template>
  <div class="home-images">
    <div class="home-project__images-container">
      <img
        class="home-project__image home-project__image--base"
        :src="`/img/${projectImgSource}`"
        v-on:mouseover="handleMouseOver"
        v-on:mouseout="handleMouseOut">
      <img
        v-bind:class="{ 'home-project__image--active': mouseOver }"
        class="home-project__image"
        :src="`/img/${projectImgSource}`">
      <img
        v-bind:class="{ 'home-project__image--active': mouseOver }"
        class="home-project__image"
        :src="`/img/${projectImgSource}`">
      <img
        v-bind:class="{ 'home-project__image--active': mouseOver }"
        class="home-project__image"
        :src="`/img/${projectImgSource}`">
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
        transitioning: false,
        tl: new TimelineMax(),
        mouseOver: false,
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
        this.projectImage = document.querySelectorAll('.home-project__image--base');
        this.projectImgSource = this.img;

        this.imgFadeIn();

        if (this.$store.getters.homeBeenHovered || this.$store.getters.mobileLayout) this.imgFadeIn();
        let suscribe = this.$store.subscribe((mutation, state) => {
          if (mutation.type === 'SET_ACTIVEINDEX') {
            this.imgUpdate();
          }
        })
      },
      imgUpdate() {
        this.imgFadeOut();

        setTimeout(() => {
          this.imgFadeIn();
          this.transitioning = false;
        }, 1000);
      },

      imgFadeIn() {
        TweenMax.to(this.projectImage, 0.2, {
          opacity: 1,
          ease: Power3.easeOut
        }, 0.05);
      },

      imgFadeOut() {
        let wasHovered = this.mouseOver;
        this.mouseOver = false;
        this.transitioning = true;

        TweenMax.to(this.projectImage, 0.2, {
          opacity: 0,
          ease: Power3.easeOut,
        });

        setTimeout(() => {
          this.updateImgsURL();

          if (wasHovered){
            this.mouseOver = true;
            this.$store.dispatch('setHomeHover', true);
          }
        }, 800);
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

      handleMouseOver() {
        if (!this.transitioning) {
          this.mouseOver = true;
          this.$store.dispatch('setHomeHover', true);
        }
      },

      handleMouseOut() {
        this.mouseOver = false;
        this.$store.dispatch('setHomeHover', false)
      }
   },
}
</script>
