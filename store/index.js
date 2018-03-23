import Vuex from 'vuex'

const createStore = () => {
  return new Vuex.Store({
    state: {
      activeIndex: 0,
      homeBeenHovered: false,
    },
    getters: {
        activeIndex (state) {
          return state.activeIndex
        },
        homeBeenHovered (state) {
          return state.homeBeenHovered
        }
    },
    mutations: {
        SET_ACTIVEINDEX (state, activeIndex) {
            state.activeIndex = activeIndex;
        },
        SET_HOMEHOVER (state, homeBeenHovered) {
          state.homeBeenHovered = homeBeenHovered
        }
      },
      actions: {
        setActiveIndex ({ commit }, activeIndex) {
          commit('SET_ACTIVEINDEX', activeIndex)
        },
        setHomeHover ({ commit }, homeBeenHovered) {
          commit('SET_HOMEHOVER', homeBeenHovered)
        }
      }
    })
  };

  export default createStore;