<template>
  <div class="d-flex align-center justify-space-between">
    <!-- <button @click="generateAccessToken">Generate Access Token</button> -->
    <!-- <button @click="generateNewAccessToken">Token from refresh token</button> -->
    <!-- <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn color="primary" v-bind="props"> Menu </v-btn>
      </template>
      <v-list>
        <v-list-item v-for="(item, index) in items" :key="index" :value="index">
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu> -->
  </div>
  <!-- <h3 class="text-center">Bear11 Filtered Stocks</h3> -->
  <v-text-field
    class="mb-4"
    v-model="risk"
    label="Risk Per Trade"
    hide-details
    required
  />
  <v-card class="ma-4 pa-4" v-for="rec in data" elevation="8">
    <div><b>Date : </b>{{ new Date(rec.date).toDateString() }}</div>
    <div><b>Symbol : </b>{{ rec.symbol }}</div>
    <div><b>Is Green : </b>{{ rec.is_green }}</div>
    <div><b>Trade Window : </b>{{ rec.trade_window }}</div>
    <div><b>First Candle High : </b>{{ rec.first_candle_high }}</div>
    <div><b>First Candle Low : </b>{{ rec.first_candle_low }}</div>
    <div>
      <b>Tradable Qty : </b
      >{{ risk > 0 ? Math.floor(risk / rec.trade_window) : 0 }}
    </div>
  </v-card>
</template>

<script setup>
import { useGlobalStore } from "@/stores/globalStore";
const globalStore = useGlobalStore();
import axios from "axios";
import { VIEW } from "../js/constant";
import { onMounted, ref, watch } from "vue";
import { prepareEndpoint } from "../js/util";

const fetchUser = async () => {
  const res = await axios.get(prepareEndpoint("/user"), {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
    },
  });
  console.log(res);
  globalStore.setUserInfo({
    username: res.data.username,
    appId: res.data.appId,
    refreshToken: res.data.refreshToken,
    appIdHash: res.data.appIdHash,
    isAdmin: res.data.isAdmin,
  });
};

const risk = ref(1000);
onMounted(async () => {
  loadData();

  const userRisk = localStorage.getItem("userRisk");
  if (userRisk) {
    risk.value = userRisk;
  }

  await fetchUser();
});

const data = ref([]);

const loadData = async () => {
  try {
    const protectedResponse = await axios.get(
      prepareEndpoint("/filtered-stocks"),
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      }
    );

    data.value = protectedResponse.data;
  } catch (err) {
    console.log(err);
    localStorage.removeItem("jwt_token");
    globalStore.setView(VIEW.AUTH);
  }
};

watch(
  () => risk.value,
  () => {
    console.log(risk.value);
    localStorage.setItem("userRisk", risk.value);
  }
);

const items = ref([
  { title: "Click Me" },
  { title: "Click Me" },
  { title: "Click Me" },
  { title: "Click Me 2" },
]);

const generateAccessToken = () => {
  console.log(
    `https://api-t1.fyers.in/api/v3/generate-authcode?client_id=${globalStore.userInfo.appId}&redirect_uri=https://bear11-2lec.onrender.com/&response_type=code&state=sample_state`
  );
};

const generateNewAccessToken = async () => {
  console.log(
    globalStore.userInfo.refreshToken,
    globalStore.userInfo.appIdHash
  );
  const res = await axios.post(
    "https://api-t1.fyers.in/api/v3/validate-refresh-token",
    {
      grant_type: "refresh_token",
      appIdHash: globalStore.userInfo.appIdHash,
      refresh_token: globalStore.userInfo.refreshToken,
      pin: "",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  console.log(res);
};
</script>
