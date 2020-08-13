
export default {
  state: {
    userName: '',
    userId: '',
    avatorImgPath: '',
    access: '',
  },
  mutations: {
    setAvator (state, avatorPath) {
      state.avatorImgPath = avatorPath
    },
    setUserId (state, id) {
      state.userId = id
    },
    setUserName (state, name) {
      state.userName = name
    },
    setAccess (state, access) {
      state.access = access
    },
  },
  getters: {

  },
  actions: {}

}
