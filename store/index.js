import Vuex from 'vuex'

const createStore = () => {
  return new Vuex.Store({
    state: {
      activeIndex: 0,
      homeBeenHovered: false,
      loaderHidden: false,
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
        }
      }
    })
  };

  export default createStore;