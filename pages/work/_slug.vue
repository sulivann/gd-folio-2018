<template>
  <div class="work">
    <case-headline />
    <case-heading />
    <case-description />
    <case-banner />
    <case-mock-up />
    <case-text />
    <case-video />
  </div>
</template>

<script>
import CaseHeadline from '~/components/CaseHeadline/CaseHeadline.vue';
import CaseHeading from '~/components/CaseHeading/CaseHeading.vue';
import CaseDescription from '~/components/CaseDescription/CaseDescription.vue';
import CaseBanner from '~/components/CaseBanner/CaseBanner.vue';
import CaseMockUp from '~/components/CaseMockUp/CaseMockUp.vue';
import CaseText from '~/components/CaseText/CaseText.vue';
import CaseVideo from '~/components/CaseVideo/CaseVideo.vue';

export default {
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
