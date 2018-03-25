<template>
  <main class="about">
    <about-aside />
    <div class="about__wrapper">
      <about-heading />
      <about-description />
      <about-links />
    </div>
  </main>
</template>

<style lang="scss">
  .about {
    display: flex;
    align-items: center;
    height: 100vh;
    position: relative;
  }

  .about__wrapper {
    width: 68%;
    max-width: 982px;
    margin: 0 auto;
  }
</style>

<script>

// Components
import AboutHeading from '~/components/AboutHeading/AboutHeading.vue';
import AboutDescription from '~/components/AboutDescription/AboutDescription.vue';
import AboutLinks from '~/components/AboutLinks/AboutLinks.vue';
import AboutAside from '~/components/AboutAside/AboutAside.vue';

export default {
  components: {
    AboutHeading,
    AboutDescription,
    AboutLinks,
    AboutAside
  }
};
</script>
