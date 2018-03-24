<template>
    <div class="home-menu">
      <ul class="home-menu__wrapper">
        <li class="home-menu__label"
        v-for="(project, index) in projects"
        v-bind:class="{ active: index === $store.state.activeIndex }"
        :key="index">{{ `0${index + 1}` }}</li>
      </ul>
      <div class="home-menu__side-line"></div>
    </div>
</template>

<style lang="scss">
  @import './HomeMenu.scss';
</style>

<script>
  import { TweenMax, Power2 } from 'gsap';

  export default {
    props: ['projects'],
    data() {
      return {
        homeMenu: '',
        menuWrapper: '',
        menuSideLine: '',
        projectsIndex: '',
        tl: new TimelineMax(),
      }
    },
    components: {
    },
    mounted() {
      this.init();
      this.setMenuAlpha();
      this.initEventListeners();
    },
    methods: {

      init() {
        this.homeMenu = document.querySelector('.home-menu');
        this.menuWrapper = this.homeMenu.querySelector('.home-menu__wrapper');
        this.menuSideLine = this.homeMenu.querySelector('.home-menu__side-line');
        this.projectsIndex = this.menuWrapper.querySelectorAll('.home-menu__label');
        this.tl.to(this.menuWrapper, 0, {
          y: -(this.$store.getters.activeIndex) * (this.menuWrapper.getBoundingClientRect().height / this.projectsIndex.length),
        })
      },

      setMenuAlpha() {
        this.projectsIndex.forEach((index, i) => {
          if (this.$store.getters.activeIndex === i){
              index.style.opacity = 1;
          } else if (i < this.$store.getters.activeIndex){
              index.style.opacity = 1 - (this.$store.getters.activeIndex - i) * 0.25
          } else {
              index.style.opacity = 1 - (i - this.$store.getters.activeIndex) * 0.25;
          }
        });
      },

      initEventListeners() {
        this.projectsIndex.forEach((el) => {el.addEventListener('click', () => {
          this.updateProjectIndex(el);
          this.setMenuAlpha();
        })});
        this.projectsIndex.forEach((index) => {
          index.addEventListener('mouseenter', () => { this.updateMenuLine(index, 0.7) });
          index.addEventListener('mouseleave', () => { this.updateMenuLine(index, 1) })
        });
      },

      updateMenuLine(index, scale) {
        if(!index.classList.contains('active')) {
          TweenMax.to(this.menuSideLine, 0.3, {
              scaleX: scale,
          });
        }
      },

      updateProjectIndex(el) {
        this.projectsIndex[this.$store.getters.activeIndex].classList.remove('active');
        const projectIndex = Array.from(el.parentElement.children).indexOf(el);
        const value = this.setIndex(projectIndex);
        this.$store.dispatch('setActiveIndex', value);
        this.projectsIndex[this.$store.getters.activeIndex].classList.add('active');
        this.setMenuAlpha();
        this.tl.to(this.menuWrapper, 0.5, {
            y: -(this.$store.getters.activeIndex) * (this.menuWrapper.getBoundingClientRect().height / this.projectsIndex.length),
            ease: Power2.easeOut,
        }).to(this.menuSideLine, 0.3, {
            scaleX: 1,
        }, '-=0.4');
      },

      setIndex(index) {
        if (index > this.projects.length - 1) {
            index = 0
        }
        if (index < 0) {
            index = this.projects.length;
        }
        return index;
      },
    },
  }
</script>
