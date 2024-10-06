<template>
  <div class="text-center">
    <div v-if="isLoading">
      <v-progress-circular
        class="my-4"
        color="primary"
        indeterminate
        :size="44"
      ></v-progress-circular>
      <p>Please wait ...</p>
    </div>
    <div v-else>
      <v-text-field
        class="mb-4"
        v-model="username"
        label="Username"
        hide-details
        required
      />
      <v-text-field
        class="mb-4"
        v-model="password"
        type="password"
        label="Password"
        hide-details
        required
      />
      <div class="d-flex justify-center">
        <v-btn
          class="ma-4"
          color="indigo-darken-3"
          size="x-large"
          variant="flat"
          @click="loginUser"
        >
          Login
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGlobalStore } from "@/stores/globalStore";
const globalStore = useGlobalStore();

import { ref } from "vue";

const username = ref("");
const password = ref("");
const isLoading = ref(false);

import { VIEW } from "../js/constant";
import axios from "axios";

const redirect = (view) => {
  globalStore.setView(view);
};

const loginUser = async () => {
  try {
    isLoading.value = true;
    const response = await axios.post("/login", {
      username: username.value,
      password: password.value,
    });
    console.log(response);

    localStorage.setItem("jwt_token", response.data.token);

    globalStore.setView(VIEW.HOME);
  } catch (error) {
    isLoading.value = false;
    console.log(error);
  }
};
</script>
