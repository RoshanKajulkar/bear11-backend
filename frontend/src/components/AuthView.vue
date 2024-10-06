<template>
  <v-card>
    <v-tabs v-model="tab" align-tabs="center" color="deep-purple-accent-4">
      <v-tab :value="VIEW.REGISTER">Register</v-tab>
      <v-tab :value="VIEW.LOGIN">Login</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <RegistrationView
        v-if="tab === VIEW.REGISTER"
        @onTabChange="onTabChange"
      />
      <LoginView v-else-if="tab === VIEW.LOGIN" />
    </v-tabs-window>
  </v-card>
</template>

<script setup>
import { useGlobalStore } from "@/stores/globalStore";
const globalStore = useGlobalStore();
import { VIEW } from "../js/constant";
import { ref, watch } from "vue";
import RegistrationView from "./RegistrationView.vue";
import LoginView from "./LoginView.vue";

const tab = ref(VIEW.LOGIN);

const onTabChange = (tabView) => {
  tab.value = tabView;
};
</script>
