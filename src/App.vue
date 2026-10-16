<template>
  <v-app>
    <v-main>
      <Contacts />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Contacts from './components/Contacts.vue';

export default defineComponent({
  name: 'App',
  components: {
    Contacts,
  },
});
</script>
