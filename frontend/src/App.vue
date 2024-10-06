<template>
  <h2 class="text-center">Dashboard</h2>

  <AuthView v-if="globalStore.view === VIEW.AUTH" />
  <HomeView v-else-if="globalStore.view === VIEW.HOME" />
  <div v-else class="text-center">
    <v-progress-circular
      class="my-4"
      color="primary"
      indeterminate
      :size="44"
    ></v-progress-circular>
  </div>
</template>

<script setup>
import { useGlobalStore } from "@/stores/globalStore";
const globalStore = useGlobalStore();

import { ref, onMounted } from "vue";
import AuthView from "./components/AuthView.vue";

import HomeView from "./components/HomeView.vue";
import { VIEW } from "./js/constant";

onMounted(() => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    globalStore.setView(VIEW.HOME);
  } else {
    globalStore.setView(VIEW.AUTH);
  }
});
</script>
