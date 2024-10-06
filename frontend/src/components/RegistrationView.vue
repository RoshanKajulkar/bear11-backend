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
        v-model="fyersId"
        label="Fyers ID"
        hide-details
        required
      />
      <v-text-field
        class="mb-4"
        v-model="appId"
        label="App ID"
        hide-details
        required
      />
      <v-text-field
        class="mb-4"
        v-model="secretId"
        label="Secret ID"
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
          @click="registerUser"
        >
          Register
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGlobalStore } from "@/stores/globalStore";
const globalStore = useGlobalStore();

import { ref, onMounted, defineEmits } from "vue";

const username = ref("");
const fyersId = ref("");
const appId = ref("");
const secretId = ref("");
const redirectURL = ref("");
const password = ref("");
const isLoading = ref(false);

import { VIEW } from "../js/constant";
import axios from "axios";

const emit = defineEmits(["onTabChange"]);

const redirect = (view) => {
  globalStore.setView(view);
};

const registerUser = async () => {
  try {
    isLoading.value = true;
    const response = await axios.post("/register", {
      username: username.value,
      fyers_id: fyersId.value,
      app_id: appId.value,
      secret_id: secretId.value,
      password: password.value,
    });
    console.log(response);

    emit("onTabChange", VIEW.LOGIN);
  } catch (error) {
    console.log(error);
  }

  isLoading.value = false;
};
</script>
