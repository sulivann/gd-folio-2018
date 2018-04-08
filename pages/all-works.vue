<template>
  <main class="all-works">
    <div class="all-works__separators">
      <div class="all-works__separator"></div>
      <div class="all-works__separator"></div>
      <div class="all-works__separator"></div>
    </div>
    <div class="all-works__case-numbers">
      <div
        v-for="(n, index) in count"
        v-bind:class="[activeIndex === index ? 'all-works__case-number--active': '']"
        :key="index"
        class="all-works__case-number">0{{index+1}}</div>
    </div>
    <div class="all-works__triggers">
      <div
        v-for="(n, index) in count"
        :key="index"
        :data-index="index"
        v-on:click="handleClick"
        class="all-works__trigger" />
    </div>
    <div class="all-works__background">
      <div class="all-works__backgroundImg"></div>
    </div>
  </main>
</template>

<style lang="scss">
  .all-works {
    position: relative;
    width: 100%;
    height: 100vh;
  }

  .all-works__separator {
    height: 0%;
    width: 1px;
    background-color: white;
    opacity: 0.1;
    position: absolute;
    bottom: 0;
  }

  .all-works__separator:nth-child(1) {
    left: 25%;
  }

  .all-works__separator:nth-child(2) {
    left: 50%;
  }

  .all-works__separator:nth-child(3) {
    left: 75%;
  }

  .all-works__case-numbers {
    opacity: 0;
  }

  .all-works__case-number {
    position: absolute;
    bottom: $space-x-large;
    transform: translateX(-50%);
    font-family: $font-family-heading;
    opacity: 0.6;
  }

  .all-works__case-number--active {
    opacity: 1;
    transition: opacity 0.7s ease-out;
    text-decoration: underline;
  }

  .all-works__case-number:nth-child(1) {
    left: 12.5%;
  }

  .all-works__case-number:nth-child(2) {
    left: 37.5%;
  }

  .all-works__case-number:nth-child(3) {
    left: 62.5%;
  }

  .all-works__case-number:nth-child(4) {
    left: 87.5%;
  }

  .all-works__backgroundImg {
    background-image: url('~/static/img/badass/mock_up_01.png');
    background-size: cover;
    background-position: 0% center;
    height: 100vh;
    width: 100vw;
    transform: translateX(25%);
  }

  .all-works__background {
    width: 25%;
    height: 100vh;
    transform: translateX(-100%);
    position: relative;
    z-index: 1000;
    overflow: hidden;
  }

  .all-works__triggers {
    position: absolute;
    z-index: 1000;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .all-works__trigger {
    width: 25%;
    height: 100vh;
    display: inline-block;
    cursor: pointer;
  }
</style>

<script>
import data from '~/static/data.json';

import { TweenMax } from 'gsap';
import 'gsap/CustomEase';

export default {
  data() {
    return {
      data: data.data,
      count: Object.keys(data.data).length,
      alreadyAnimated: false,
      targeted: this.$store.getters.activeIndex,
      activeIndex: this.$store.getters.activeIndex
    }
  },
  mounted() {
    this.background = document.querySelector('.all-works__backgroundImg');
    this.backgroundContainer = document.querySelector('.all-works__background');
    this.startEnterAnimation();

    document.addEventListener('mousemove', (e) => {
      this.handleMouseOver(e);
    });

    setTimeout(() => {
      this.interval = setInterval(this.handleIntervalFunction, 250);
    }, 3500);
  },
  methods: {
    handleMouseOver(event) {
      let index = event.target.dataset.index;
      if (index !== undefined) {
        this.targeted = parseInt(event.target.dataset.index);
      }
    },
    handleIntervalFunction() {
      if (!this.alreadyAnimated && this.targeted !== this.activeIndex) {
        this.alreadyAnimated = true;
        this.triggerAnimation(this.targeted);
        this.activeIndex = this.targeted;
        setTimeout(() => {
          TweenMax.set(this.background, { clearProps:"all" });
          TweenMax.set(this.backgroundContainer, { clearProps:"all" });
          this.alreadyAnimated = false;
        }, 420);
      }
    },
    startEnterAnimation() {
      let tl = new TimelineMax();
      const separators = document.querySelectorAll('.all-works__separator');
      const numbers = document.querySelectorAll('.all-works__case-numbers');

      tl.delay(1.5);

      tl.add('first-step');
      tl.add('second-step');

      tl.to(separators, 1.5, {
        height: '100%',
        ease: Expo.easeOut,
      }, 'first-step');

      tl.to(numbers, 0.7, {
        opacity: 1,
        ease: Expo.easeOut,
        delay: 0.5,
      }, 'second-step');

      tl.set({}, {}, 2);
    },
    handleClick() {
      const slug = Object.values(this.data)[this.activeIndex].slug;
      this.$store.dispatch('triggerClickEvent');
    },
    triggerAnimation(index) {
      let banner = Object.values(this.data)[index].banner.src;
      this.background.style.backgroundImage = `url('./img/${banner}')`;

      this.tween = TweenMax.to(this.backgroundContainer, 0.4, {
        x: "400%",
        force3D: true,
        // ease: CustomEase.create('custom", "1, 0, 0, 1')
      });

      this.tween = TweenMax.to(this.background, 0.4, {
        x: "-100%",
        force3D: true,
        // ease: CustomEase.create('custom", "1, 0, 0, 1')
      });

      setTimeout(() => {
        this.$store.dispatch('setActiveIndex', index);
      }, 100);
    }
  },
};
</script>
