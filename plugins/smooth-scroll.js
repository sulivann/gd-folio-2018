import Vue from 'vue';
import Scrollbar from 'smooth-scrollbar';
import OverscrollPlugin from 'smooth-scrollbar/plugins/overscroll';

export default Vue.directive('smooth-scroll', {
  bind: function (el) {
    Scrollbar.use(OverscrollPlugin);
    Scrollbar.init(el, {
      speed: 0.75
    },)
  },
});
