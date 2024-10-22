import { createApp } from "vue";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { createPinia } from "pinia";
import "@mdi/font/css/materialdesignicons.css";

import App from "./App.vue";

const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  components,
  directives,
  theme: {
    defaultTheme: "light",
  },
});

const pinia = createPinia();

createApp(App).use(vuetify).use(pinia).mount("#app");
