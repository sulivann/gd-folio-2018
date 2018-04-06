<template>
  <main class="all-works">
    <div class="all-works__separators">
      <div class="all-works__separator"></div>
      <div class="all-works__separator"></div>
      <div class="all-works__separator"></div>
    </div>
    <div class="all-works__case-numbers">
      <div class="all-works__case-number">01</div>
      <div class="all-works__case-number">02</div>
      <div class="all-works__case-number">03</div>
      <div class="all-works__case-number">04</div>
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
    height: 100%;
    width: 1px;
    background-color: white;
    opacity: 0.1;
    position: absolute;
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

  .all-works__case-number {
    position: absolute;
    bottom: $space-x-large;
    transform: translateX(-50%);
    font-family: $font-family-heading;
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
    width: 20%;
    height: 100vh;
    transform: translateX(-100%);
    position: relative;
    z-index: 1000;
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
    document.addEventListener('mousemove', (e) => {
      this.handleMouseOver(e);
    });
    this.interval = setInterval(this.handleIntervalFunction, 250);
  },
  methods: {
    handleMouseOver(event) {
      this.targeted = parseInt(event.target.dataset.index);
    },
    handleIntervalFunction() {
      if (!this.alreadyAnimated && this.targeted !== this.activeIndex) {
        this.alreadyAnimated = true;
        this.triggerAnimation(this.targeted);
        this.activeIndex = this.targeted;
        setTimeout(() => {
          TweenMax.set(this.background, { clearProps:"all" });
          this.alreadyAnimated = false;
        }, 1500);
      }
    },
    handleClick() {
      const slug = Object.values(this.data)[this.activeIndex].slug;
      this.$store.dispatch('triggerClickEvent');
    },
    triggerAnimation(index) {
      let banner = Object.values(this.data)[index].banner.src;
      this.background.style.backgroundImage = `url('./img/${banner}')`
      this.tween = TweenMax.to(this.background, 0.4, {
        backgroundPosition: "100% center",
        x: "500%",
        force3D: true,
        ease: CustomEase.create('custom", "0.86, 0, 0.07, 1')
      });

      setTimeout(() => {
        this.$store.dispatch('setActiveIndex', index);
      }, 150);
    }
  },
};
</script>
