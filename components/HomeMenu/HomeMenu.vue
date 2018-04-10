<template>
    <div class="home-menu">
      <div class="home-menu__active">0{{this.projectIndex}}</div>
      <div class="home-menu__side-line"></div>
      <div class="home-menu__length">0{{dataLength}}</div>
    </div>
</template>

<style lang="scss">
  @import './HomeMenu.scss';
</style>

<script>
  import { TweenMax, Power2 } from 'gsap';

  import data from '~/static/data.json';

  export default {
    props: ['projects'],
    data() {
      return {
        dataLength: Object.keys(data.data).length,
        homeMenu: '',
        menuWrapper: '',
        menuSideLine: '',
        projectIndex: this.$store.state.activeIndex + 1,
        subscribe: '',
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
        this.homeMenu = document.querySelector('.home-menu');

        TweenMax.to(this.$el, 0.7, {
          opacity: 1,
          easing: Power2.easeOut
        });

        this.subscribe = this.$store.subscribe((mutation, state) => {
          if (mutation.type === 'SET_ACTIVEINDEX') {
            this.projectIndex = this.$store.state.activeIndex + 1;
          }
        });
      },

      setIndex(index) {
        if (index > this.projects.length - 1) {
            index = 0
        }
        if (index < 0) {
            index = this.projects.length;
        }
        return index;
      }
    },
  }
</script>
