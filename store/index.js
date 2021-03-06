import Vuex from 'vuex'

const createStore = () => {
  return new Vuex.Store({
    state: {
      activeIndex: 0,
      homeBeenHovered: false,
      loaderHidden: false,
      mobileLayout: false,
      pixelRatio: null
    },
    getters: {
        activeIndex (state) {
          return state.activeIndex
        },
        homeBeenHovered (state) {
          return state.homeBeenHovered
        },
        loadingHidden (state) {
          return state.loadingHidden
        },
        mobileLayout (state) {
          return state.mobileLayout
        },
        pixelRatio (state) {
          return state.pixelRatio
        }
    },
    mutations: {
        SET_ACTIVEINDEX (state, activeIndex) {
          state.activeIndex = activeIndex;
        },
        SET_HOMEHOVER (state, homeBeenHovered) {
          state.homeBeenHovered = homeBeenHovered;
        },
        SET_LOADERHIDDEN (state, loaderHidden) {
          state.loaderHidden = loaderHidden;
        },
        SET_MOBILELAYOUT (state, mobileLayout) {
          state.mobileLayout = mobileLayout;
        },
        SET_PIXELRATIO (state, pixelRatio) {
          state.pixelRatio = pixelRatio;
        },
        TRIGGER_TRANSITION_EVENT () {},
        TRIGGER_BACK_TO_CENTER_EVENT () {},
        TRIGGER_CLICK_TO_CASE_EVENT () {}
      },
    actions: {
      setActiveIndex ({ commit }, activeIndex) {
        commit('SET_ACTIVEINDEX', activeIndex);
      },
      setHomeHover ({ commit }, homeBeenHovered) {
        commit('SET_HOMEHOVER', homeBeenHovered);
      },
      setLoaderHidden ({ commit }, loaderHidden) {
        commit('SET_LOADERHIDDEN', loaderHidden);
      },
      setMobileLayout ({ commit }, mobileLayout) {
        commit('SET_MOBILELAYOUT', mobileLayout);
      },
      setpixelRatio ({ commit }, pixelRatio) {
        commit('SET_PIXELRATIO', pixelRatio);
      },
      triggerTransitionEvent ({ commit }) {
        commit('TRIGGER_TRANSITION_EVENT');
      },
      triggerBackToCenter ({ commit }) {
        commit('TRIGGER_BACK_TO_CENTER_EVENT');
      },
      triggerClickToCaseEvent ({ commit }) {
        commit('TRIGGER_CLICK_TO_CASE_EVENT');
      }
    }
    })
  };

  export default createStore;
