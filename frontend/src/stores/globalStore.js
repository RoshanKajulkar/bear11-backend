import { defineStore } from "pinia";
import { VIEW } from "../js/constant";

export const useGlobalStore = defineStore("globalStore", {
  state: () => ({
    view: null,
  }),

  actions: {
    setView(view) {
      this.view = view;
    },
  },
});
