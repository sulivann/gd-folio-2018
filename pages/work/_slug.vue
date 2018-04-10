<template>
  <div class="work">
    <case-banner
      :banner="data.banner"/>
    <case-title
      :title="data.title" />
    <div class="work__header">
      <case-heading
        :role="data.role"
        :contextLabel="data.contextLabel"
        :context="data.context"
        :year="data.year"
        :projectNumber="data.projectNumber"/>
      <case-description
        :description="data.description" />
    </div>
    <div class="work__element" v-for="(element, index) in data.elements" :key='index'>
      <case-video
        v-if="element.type === 'video'"
        :sources="element.sources" />
      <case-text
        v-if="element.type === 'text'"
        :text="element.text"/>
      <case-mock-up
        v-if="element.type === 'mockup'"
        :src="element.src"/>
    </div>
  </div>
</template>

<style lang="scss">
  .work {
    padding-bottom: $space-xtra-large;

    &__header {
      max-width: 550px;
      width: 38%;
      margin-top: $space-x-large;
      margin-bottom: $space-x-large;
      margin-left: 45%;
      opacity: 0;
    }

    &__element:last-child div {
      margin-bottom: 0;
    }
  }
</style>

<script>
// Data
import data from '~/static/data.json';

// Components
import CaseHeadline from '~/components/CaseHeadline/CaseHeadline.vue';
import CaseHeading from '~/components/CaseHeading/CaseHeading.vue';
import CaseDescription from '~/components/CaseDescription/CaseDescription.vue';
import CaseBanner from '~/components/CaseBanner/CaseBanner.vue';
import CaseMockUp from '~/components/CaseMockUp/CaseMockUp.vue';
import CaseText from '~/components/CaseText/CaseText.vue';
import CaseVideo from '~/components/CaseVideo/CaseVideo.vue';
import CaseTitle from '~/components/CaseTitle/CaseTitle.vue';

export default {
  transition: {
    mode: 'out-in',
    css: false,
    leave (el, done) {
      if (this.$route.name === 'index' || this.$route.name === 'all-works') {
        this.$store.dispatch('triggerBackToCenter');
        setTimeout(() => {
          done();
        }, 800);
      } else {
        done();
      }
    }
  },
  validate({ params }) {
    if (data.data[params.slug] === undefined) {
      return false
    }
    return true;
  },
  data() {
    return {
      mouse: {
        posX: '',
        posY: '',
      },
      footerIndex: '',
      viewport: {
        w: process.browser ? window.innerWidth : undefined,
        h: process.browser ? window.innerHeight : undefined,
      },
      canvasPos: 'header',
      data: data.data[this.$route.params.slug],
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
  mounted() {
    this.init();
  },
  methods: {
    init() {
      // this.footerIndex = this.setIndex(this.$store.getters.activeIndex + 1);
      this.startEnterAnimations();
      document.addEventListener('mousemove', (e) => {
        this.updateMousePosition(e);
      });
    },
    startEnterAnimations() {
      let tl = new TimelineMax();

      const caseBanner = document.querySelector('.case-banner');
      const caseTitle = document.querySelector('.case-title');
      const caseHeader = document.querySelector('.work__header');

      tl.add('first-step');

      tl.to(caseBanner, 0.7, {
        opacity: 1,
        ease: Expo.easeOut
      }, 'first-step');

      tl.add('second-step');

      tl.to(caseTitle, 0.7, {
        opacity: 1,
        ease: Expo.easeOut
      }, 'second-step');

      tl.to(caseHeader, 0.7, {
        opacity: 1,
        ease: Expo.easeOut
      }, 'second-step');
    },
    setIndex(index) {
      if (index > this.titles.length - 1) {
          index = 0
      }
      if (index < 0) {
          index = this.titles.length - 1;
      }
      return index;
    },
    updateMousePosition(e) {
      this.mouse.posX = e.clientX;
      this.mouse.posY = e.clientY;
      this.$emit('mousemove', this.mouse)
    },
  },
  components: {
    CaseHeadline,
    CaseHeading,
    CaseDescription,
    CaseBanner,
    CaseMockUp,
    CaseText,
    CaseVideo,
    CaseTitle
  }
};
</script>
