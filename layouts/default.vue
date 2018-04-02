<template>
  <div>
    <div class="main">
      <!-- <Loader v-if="showLoader" :titles="data.titles" :viewport="viewport"/> -->
      <nuxt />
    </div>
  </div>
</template>

<script>
// Data
import data from '~/static/data.json';

import Loader from '~/components/Loader/Loader.vue';

export default {

  data() {
    return {
      activeIndex: this.$route.path.search('/work/') !== -1  ? this.$store.dispatch('setActiveIndex', this.setIndex(Object.keys(data.data).indexOf(this.$route.params.slug))) : 0,
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
      viewport: {
        w: process.browser ? window.innerWidth : undefined,
        h: process.browser ? window.innerHeight : undefined,
      },
      showLoader: true,
      showContent: false,
    }
  },

  components: {
    Loader,
  },

  mounted() {
    this.init();
  },

  methods: {
    init() {
      this.resizeEvent = window.addEventListener('resize', this.checkMobileLayout);
      this.checkMobileLayout();
      let subscribe = this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'SET_LOADERHIDDEN' && this.$store.state.loaderHidden === true) {
          this.showContent = true;
          setTimeout(() => {
            this.showLoader = false;
          }, 200);
        }
      });
    },
    setIndex(index) {
      if (index > data.data.length - 1) {
          index = 0
      }
      if (index < 0) {
          index = data.data.length - 1;
      }
      return index;
    },
    checkMobileLayout() {
      if (window.innerWidth <= 900) {
        this.$store.dispatch('setMobileLayout', true);
      } else {
        this.$store.dispatch('setMobileLayout', false);
      }
    }
  }
}
</script>

<style lang="scss">
  .main {
    height: 100vh;
    width: 100%;
    background-color: #0D0D0D;

    &::before {
      content: '';
      z-index: 0;
      position: absolute;
      top: -100%;
      left: -100%;
      width: 300%;
      height: 300%;
      background: url('https://anatacreative.com/codepen/noise.png');
      opacity: 0.8;
      animation: 2s steps(10) infinite noise;
      pointer-events: none;
    }

    &::after {
      content: '';
      z-index: -10;
      position: absolute;
      top: 0;
      width: 100vh;
      height: 100vh;
      border-radius: 50%;
      background: -moz-radial-gradient(center, ellipse cover,  rgba(255, 255, 255, 0.05) 0%, transparent); /* FF3.6-15 */
      background: -webkit-radial-gradient(center, ellipse cover, rgba(255, 255, 255, 0.05) 0%, transparent); /* Chrome10-25,Safari5.1-6 */
      background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05) 0%, transparent); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
      mix-blend-mode: soft-light;
      //filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#1affffff', endColorstr='#00ffffff',GradientType=1 ); /* IE6-9 fallback on horizontal gradient */
    }
  }

  @keyframes noise {
  0%, 100% {
      transform: translate(0,0);
    }

    10% {
      transform: translate(-5,-10%);
    }

    20% {
      transform: translate(-15,5%);
    }

    30% {
      transform: translate(7%,-25%);
    }

    40% {
      transform: translate(20%,25%);
    }

    50% {
      transform: translate(-5,-10%);
    }

    60% {
      transform: translate(-15,5%);
    }

    70% {
      transform: translate(7%,-25%);
    }

    80% {
      transform: translate(20%,25%);
    }

    90% {
      transform: translate(-5,-10%);
    }
  }
</style>
