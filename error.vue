<script lang="ts" setup>
import { DEFAULT_HOSTNAME } from './constants';

const props = defineProps({
  error: Object
});

const tips = {
  '404': 'The requested page was not found.',
  '500': 'The web service is experiencing internal problems. Please try again later.'
};

const showGoHome = ref(false);

onMounted(() => {
  if (document.location.hostname === DEFAULT_HOSTNAME)
    showGoHome.value = true;
});

const router = useRouter();
</script>

<template lang="pug">
.container
  img.icon(src="@/assets/images/crash.svg", alt="sadface")
  .content
    h3.title {{ error.statusMessage }}
    p {{ tips[error.statusCode] || error.statusMessage }}
  .buttons
    .button(v-ripple, @click="router.back()")
      chevronlefticon.icon
      | Go back
    NuxtLink.button.secondary(v-ripple, to="/", v-if="showGoHome")
      homeicon.icon
      | Go home
</template>

<style lang="scss" src="@/assets/styles/pages/error.scss" scoped></style>