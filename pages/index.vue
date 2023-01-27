<script lang="ts" setup>
import { DEFAULT_HOSTNAME } from '@/constants';
</script>

<template lang="pug">
.app
  .middle
    kaomoji
    span {{ DEFAULT_HOSTNAME }}
</template>

<style lang="scss" src="@/assets/styles/pages/index.scss" scoped></style>