import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          background: '#F3F5F7',
          surface: '#FFFFFF',
          primary: '#2A9B8E',
          secondary: '#1B3A4B',
          accent: '#2A9B8E',
          error: '#E57373',
          info: '#2A9B8E',
          success: '#2A9B8E',
          warning: '#FFC107',
        },
      },
    },
  },
  defaults: {
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VBtn: {
      style: 'text-transform: none; font-weight: 500;',
    },
    VCard: {
      elevation: 1,
      rounded: 'lg',
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
});
