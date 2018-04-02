<template>
  <div class="work" v-smooth-scroll>
    <title-canvas :titles="titles" 
      :viewport="viewport" 
      position="header"/>
    <case-heading
      :role="data.role"
      :contextLabel="data.contextLabel"
      :context="data.context"
      :year="data.year"
      :projectNumber="data.projectNumber"/>
    <case-description
      :description="data.description" />
    <case-banner
      :banner="data.banner"/>
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
    <div class="work__footer">
      <title-canvas 
        position="footer" 
        :titles="titles" 
        :viewport="viewport"
        :projectIndex="this.setIndex(this.$store.getters.activeIndex + 1)"/>
    </div>
  </div>
</template>

<style lang="scss">
  .work {
    height: 100vh;
    width: 100%;
    background-color: #0D0D0D;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    .work__footer {
      position: absolute;
      width: 100%;
      height: 100vh;
      bottom: -40vh;
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
import TitleCanvas from '~/components/TitleCanvas/TitleCanvas.vue';

export default {
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
      position: 'header',
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
      document.addEventListener('mousemove', (e) => {
        this.updateMousePosition(e);
      });
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
    TitleCanvas
  }
};
</script>
