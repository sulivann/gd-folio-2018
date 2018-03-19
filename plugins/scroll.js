import Vue from 'vue';

export default Vue.directive('scroll', {
  inserted: function(el, binding) {
    let f = function(evt) {
      if (binding.value(evt, el)) {
        window.removeEventListener('DOMMouseScroll', f);
        window.removeEventListener('mousewheel', f);
        window.removeEventListener('wheel', f);
      }
    };

    if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', f, false);
      window.addEventListener('mousewheel', f, false);
    } else {
      window.addEventListener('wheel', f);
    }
  },
});
