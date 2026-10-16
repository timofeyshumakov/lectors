import { createApp } from 'vue';
// Pinia
import { createPinia } from 'pinia';
// Vuetify
import 'vuetify/styles';
import vuetify from './plugins/vuetify';
// Styles
import './styles/bitrix-theme.scss';
import VueTheMask from 'vue-the-mask';
// Components
import App from './App.vue';
import './reset.sass';
import { Form, Field } from 'vee-validate'

// Create Pinia instance
const pinia = createPinia();

// Create Vue app
const app = createApp(App);

// Use plugins and components
app.use(vuetify)
  .use(VueTheMask)
  .use(pinia)
  .component('Form', Form)
  .component('Field', Field)
  .mount('#app');
