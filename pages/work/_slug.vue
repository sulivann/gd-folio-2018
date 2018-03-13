<template>
  <div class="work">
    <case-headline />
    <case-heading />
    <case-description />
  </div>
</template>

<script>
import CaseHeadline from '~/components/CaseHeadline/CaseHeadline.vue';
import CaseHeading from '~/components/CaseHeading/CaseHeading.vue';
import CaseDescription from '~/components/CaseDescription/CaseDescription.vue';

export default {
  components: {
    CaseHeadline,
    CaseHeading,
    CaseDescription
  }
};
</script>
