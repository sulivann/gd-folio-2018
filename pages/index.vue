<template>
  <div>
    <h1 class="title">
      gd-folio-2018
    </h1>
    <nuxt-link to="/about">about</nuxt-link>
    <dummy/>
  </div>
</template>
<script>
import Dummy from '~/components/DummyComponent/DummyComponent.vue';

export default {
  components: {
    Dummy
  }
};
</script>
