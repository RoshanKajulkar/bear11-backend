import { defineStore } from "pinia";
import { VIEW } from "../js/constant";

export const useGlobalStore = defineStore("globalStore", {
  state: () => ({
    view: null,
    userInfo: {
      name: "",
      appId: "",
      refreshToken: "",
      appIdHash: "",
      isAdmin: false,
    },
  }),

  actions: {
    setView(view) {
      this.view = view;
    },
    setUserInfo({ username, appId, refreshToken, appIdHash, isAdmin }) {
      this.userInfo.name = username;
      this.userInfo.appId = appId;
      this.userInfo.refreshToken = refreshToken;
      this.userInfo.appIdHash = appIdHash;
      this.userInfo.isAdmin = isAdmin;
    },
  },
});
