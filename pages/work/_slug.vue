<template>
  <div class="work">
    <case-headline
      :title="name"/>
    <case-heading
      :role="role"
      :contextLabel="contextLabel"
      :context="context"
      :year="year"
      :projectNumber="projectNumber"/>
    <case-description
      :description="description" />
    <case-banner
      :banner="banner"/>
    <div class="work__element" v-for="(element, index) in elements" :key='index'>
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

export default {
  validate({ params }) {
    if (data.data[params.slug] === undefined) {
      return false
    }
    return true;
  },
  data() {
    return data.data[this.$route.params.slug];
  },
  components: {
    CaseHeadline,
    CaseHeading,
    CaseDescription,
    CaseBanner,
    CaseMockUp,
    CaseText,
    CaseVideo
  }
};
</script>
