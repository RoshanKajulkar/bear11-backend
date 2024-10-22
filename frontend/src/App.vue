<template>
  <v-app>
    <AuthView v-if="globalStore.view === VIEW.AUTH" />
    <v-container v-else-if="globalStore.view === VIEW.HOME">
      <v-app-bar :elevation="2">
        <template v-slot:prepend>
          <v-icon class="ma-2" icon="mdi-menu" @click="showNavBar" />
        </template>

        <v-app-bar-title class="d-flex justify-end ma-4">
          <b>{{ globalStore.userInfo.name || "Pragati Share Market" }}</b>
        </v-app-bar-title>
      </v-app-bar>

      <v-navigation-drawer
        v-model="isDrawerVisible"
        :location="$vuetify.display.mobile ? 'top' : undefined"
        temporary
      >
        <v-list>
          <div v-for="option in menu">
            <v-list-item
              :prepend-icon="option.icon"
              :title="option.title"
              :value="option.value"
              @click="() => onMenuSelect(option.value)"
            />
          </div>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <HomeView />
      </v-main>
    </v-container>
  </v-app>
</template>

<script setup>
import { useGlobalStore } from "@/stores/globalStore";
const globalStore = useGlobalStore();
import axios from "axios";
import { ref, onMounted } from "vue";
import AuthView from "./components/AuthView.vue";

import HomeView from "./components/HomeView.vue";
import { VIEW } from "./js/constant";
import { prepareEndpoint } from "./js/util";

const menu = ref([
  {
    icon: "mdi-filter-multiple-outline",
    title: "Bear11 Filtered Stocks",
    value: "bear11-filtered-view",
  },
  {
    icon: "mdi-logout",
    title: "Logout",
    value: "logout",
  },
]);

const onMenuSelect = (selectedMenu) => {
  isDrawerVisible.value = false;

  console.log(selectedMenu);
  if (selectedMenu === "logout") {
    localStorage.clear();
    globalStore.setView(VIEW.AUTH);
  }
};

const getToken = async (authCode) => {
  const res = await axios.post(
    prepareEndpoint("/getToken"),
    { auth_code: authCode },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
      },
    }
  );
  console.log(res);
  // globalStore.setUserInfo({
  //   username: res.data.username,
  //   appId: res.data.appId,
  // });
};

onMounted(async () => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    globalStore.setView(VIEW.HOME);
  } else {
    globalStore.setView(VIEW.AUTH);
  }

  const query = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(query.entries());
  if (params.auth_code) {
    console.log(params.auth_code);
    const res = await getToken(params.auth_code);
    console.log(res);

    window.location.href = window.location.origin;
  }
});

const isDrawerVisible = ref(false);

const showNavBar = () => {
  if (globalStore.userInfo.name) {
    isDrawerVisible.value = !isDrawerVisible.value;
  }
};
</script>
