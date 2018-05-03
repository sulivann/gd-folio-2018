<template>
    <main class="home">
      <div class="home__wrapper">
        <home-nav />
        <home-menu :projects="data.titles" />
      </div>
      <home-images :img="data.home_img" :viewport="viewport" />
      <home-subtitle :role="data.role" />
    </main>
</template>

<style lang="scss">
  .home {
    width: 100%;
    height: 100vh;

    &__wrapper {
      width: 95%;
      margin: 0 auto;
      position: relative;
      z-index: 10;
    }
  }
</style>

<script>
// Data
import data from '~/static/data.json';

import { TimelineMax, TweenMax, Sine } from 'gsap';

// import HomeCase from '~/components/HomeCase/HomeCase.vue';
import HomeMenu from '~/components/HomeMenu/HomeMenu.vue';
import HomeImages from '~/components/HomeImages/HomeImages.vue';
import HomeSubtitle from '~/components/HomeSubtitle/HomeSubtitle.vue';
import HomeNav from '~/components/HomeNav/HomeNav.vue';

export default {
  transition: {
    mode: 'out-in',
    css: false,
    leave (el, done) {
      const homeImages = document.querySelector('.home-images');
      const homeMenu = document.querySelector('.home-menu');
      const projectSubtitle = document.querySelector('.project-subtitle');

      // BEST HACK EVER
      if (homeImages && homeMenu && projectSubtitle) {
        let tl = new TimelineMax({ onComplete: done });
        tl.add('first-step');

        tl.to(homeImages, 0.7, {
          opacity: 0,
          ease: Expo.easeOut
        }, 'first-step');

        tl.add('second-step');

        tl.to(homeMenu, 0.7, {
          opacity: 0,
          ease: Expo.easeOut
        }, 'second-step');

        tl.to(projectSubtitle, 0.7, {
          opacity: 0,
          ease: Expo.easeOut
        }, 'second-step');
      } else {
        done();
      }
    }
  },

  components: {
    HomeMenu,
    HomeImages,
    HomeSubtitle,
    HomeNav,
  },

  data() {
    return {
      data: {
        home_img: data.data[Object.keys(data.data)[this.$store.getters.activeIndex]].home_img,
        role: data.data[Object.keys(data.data)[this.$store.getters.activeIndex]].role,
        titles: Object.keys(data.data).reduce((previous, key) => {
          previous.push({
            name: data.data[key].slug,
            svgTitleVB: data.data[key].svgTitleVB,
            svgTitlePath: data.data[key].svgTitlePath,
          });
          return previous;
        }, []),
      },
      scrolling: false,
      mouse: {
        posX: '',
        posY: '',
      },
      viewport: {
        w: process.browser ? window.innerWidth : undefined,
        h: process.browser ? window.innerHeight : undefined,
      },
      position: 'center'
    }
  },

  mounted() {
    this.init();
  },
  beforeDestroy() {
     document.removeEventListener('wheel', this.wheelEvent);
  },
  methods: {
    init() {
      document.addEventListener('mousemove', (e) => {
        this.updateMousePosition(e);
      });
      document.addEventListener('wheel', this.wheelEvent);
       let suscribe = this.$store.subscribe((mutation, state) => {
          if (mutation.type === 'SET_ACTIVEINDEX' && this.$store.state.homeBeenHovered === true) {
            this.updateData();
          }
       });
    },
    wheelEvent(e) {
      if (this.scrolling === false) {
        this.scrolling = true;
        let nextProjectIndex = undefined;
        let value;
        if (e.deltaY > 0) {
          value = this.setIndex(this.$store.getters.activeIndex + 1);
          this.$store.dispatch('setActiveIndex', value);
        } else if (e.deltaY < 0) {
          value = this.setIndex(this.$store.getters.activeIndex - 1);
          this.$store.dispatch('setActiveIndex', value);
        }
        this.updateData();
        setTimeout(() => {
          this.scrolling = false;
        }, 1500)
      }
    },
    updateMousePosition(e) {
      this.mouse.posX = e.clientX;
      this.mouse.posY = e.clientY;
      this.$emit('mousemove', this.mouse)
    },
    updateData() {
      this.data = {
        home_img: data.data[Object.keys(data.data)[this.$store.getters.activeIndex]].home_img,
        role: data.data[Object.keys(data.data)[this.$store.getters.activeIndex]].role,
        titles: Object.keys(data.data).reduce((previous, key) => {
          previous.push({
            name: data.data[key].slug,
            svgTitleVB: data.data[key].svgTitleVB,
            svgTitlePath: data.data[key].svgTitlePath,
          });
          return previous;
        }, []),
      }
    },
    setIndex(index) {
      if (index > this.data.titles.length - 1) {
          index = 0
      }
      if (index < 0) {
          index = this.data.titles.length - 1;
      }
      return index;
    },
  }
}
</script>
