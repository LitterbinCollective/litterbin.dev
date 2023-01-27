import ripple from 'vue3-whr-ripple-directive';

export default defineNuxtPlugin((app) =>
  app.vueApp.directive('ripple', ripple)
);