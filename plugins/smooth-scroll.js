import Vue from 'vue';
import Scrollbar from 'smooth-scrollbar';

export default Vue.directive('smooth-scroll', {
  bind: function (el) {
    Scrollbar.init(el, {
      speed: 0.75
    },)
  },
});
