import Vuex from 'vuex'

const createStore = () => {
  return new Vuex.Store({
    state: {
      activeIndex: 0,
      homeBeenHovered: false,
      loaderHidden: false,
      mobileLayout: false,
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
        }
    },
    mutations: {
        SET_ACTIVEINDEX (state, activeIndex) {
            state.activeIndex = activeIndex;
        },
        SET_HOMEHOVER (state, homeBeenHovered) {
          state.homeBeenHovered = homeBeenHovered
        },
        SET_LOADERHIDDEN (state, loaderHidden) {
          state.loaderHidden = loaderHidden
        },
        SET_MOBILELAYOUT (state, mobileLayout) {
          state.mobileLayout = mobileLayout
        }
      },
      actions: {
        setActiveIndex ({ commit }, activeIndex) {
          commit('SET_ACTIVEINDEX', activeIndex)
        },
        setHomeHover ({ commit }, homeBeenHovered) {
          commit('SET_HOMEHOVER', homeBeenHovered)
        },
        setLoaderHidden ({ commit }, loaderHidden) {
          commit('SET_LOADERHIDDEN', loaderHidden)
        },
        setMobileLayout ({ commit }, mobileLayout) {
          commit('SET_MOBILELAYOUT', mobileLayout)
        },
      }
    })
  };

  export default createStore;