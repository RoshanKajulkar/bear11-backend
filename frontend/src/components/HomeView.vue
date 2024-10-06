<template>
  <h3 class="text-center">Bear11 Filtered Stocks</h3>
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

const risk = ref(1000);

onMounted(() => {
  loadData();

  const userRisk = localStorage.getItem("userRisk");
  if (userRisk) {
    risk.value = userRisk;
  }
});

const data = ref([]);

const loadData = async () => {
  try {
    const protectedResponse = await axios.get("/filtered-stocks", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
      },
    });

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
</script>
