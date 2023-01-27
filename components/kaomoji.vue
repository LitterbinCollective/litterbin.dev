<script lang="ts" setup>
import { KAOMOJI_FACES } from '@/constants';

const CONSTRAIN = 16;
const PRE_BLINK_DURATION = 100;
const OUT_OF_RANGE_TIMEOUT = 10000;
const COUNT_RESET_TIMEOUT = 1000;
const BLINK_PROBABILITY = 0.07;
const ROTATE_TO_PROBABLITIY = 0.03;

const props = defineProps({
  active: {
    type: Boolean
  }
});

const face = ref(KAOMOJI_FACES.UNACTIVE);
const transform = ref('');
const transition = ref('');
const faceTransform = ref('');

let active = props.active || false;
let inProgress = false;
let outOfRange = false;
let outOfRangeStart = 0;
let interval: any;
let count = 0;
let lastCountUpdate = Date.now();
let previousX = 0;

function rotateTo(mx: number, my: number) {
  const element = document.body.getBoundingClientRect();
  const rotateX = -(my - element.y - (element.height / 2)) / CONSTRAIN,
    rotateY = (mx - element.x - (element.width / 2)) / CONSTRAIN;
  transform.value = `perspective(360px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function mousemove(e: MouseEvent) {
  if (!active) return;

  rotateTo(e.clientX, e.clientY);
}

function faceMousemove({ clientX }: MouseEvent) {
  if (!active) return;

  if (Math.abs(clientX - previousX) > 12) {
    count++;
    if (count > 10 && Date.now() - lastCountUpdate >= PRE_BLINK_DURATION)
      lastCountUpdate = Date.now() - PRE_BLINK_DURATION - 1
    else
      lastCountUpdate = Date.now();
  }

  previousX = clientX;
}

function mouseout(e: MouseEvent | Event) {
  if (!active || props.active) return;

  const mx = (e as MouseEvent).clientX || 0,
    my = (e as MouseEvent).clientY || 0;

  const boundariesCheck = mx <= 0 || my <= 0 ||
    mx >= document.body.clientWidth || my >= document.body.clientHeight;
  if (boundariesCheck && !outOfRange) {
    outOfRange = true;
    outOfRangeStart = Date.now();
  }
}

function mouseenter() {
  if (!active || props.active) return;

  outOfRange = false;
  transition.value = '';
  face.value = KAOMOJI_FACES.DEFAULT;
}

function activity() {
  if (!active) return;
  const rng = Math.random();
  const time = Date.now();

  if (!outOfRange) {
    const countDeltaTime = time - lastCountUpdate;
    if (countDeltaTime >= COUNT_RESET_TIMEOUT)
      count = 0;

    if (count >= 10)
      return face.value = countDeltaTime >= PRE_BLINK_DURATION ?
        KAOMOJI_FACES.HAPPY :
        KAOMOJI_FACES.CLOSED_EYES;

    if (rng < BLINK_PROBABILITY)
      return face.value = KAOMOJI_FACES.CLOSED_EYES;
    face.value = KAOMOJI_FACES.DEFAULT;
  } else {
    transition.value = '.5s';

    const outOfRangeDeltaTime = time - outOfRangeStart;
    face.value = outOfRangeDeltaTime >= PRE_BLINK_DURATION ?
      KAOMOJI_FACES.SAD :
      KAOMOJI_FACES.CLOSED_EYES;

    const { clientWidth, clientHeight } = document.body;
    if (rng < ROTATE_TO_PROBABLITIY)
      rotateTo(
        Math.floor(Math.random() * clientWidth),
        Math.floor(Math.random() * clientHeight)
      );

    if (outOfRangeDeltaTime >= OUT_OF_RANGE_TIMEOUT) {
      active = false;
      face.value = KAOMOJI_FACES.UNACTIVE;
      transform.value = '';
      outOfRange = false;
      setTimeout(() => transition.value = '', 500);
    }
  }
}

function activate() {
  if (inProgress || active) return;
  inProgress = true;
  face.value = KAOMOJI_FACES.SCARED;

  transition.value = '.1s cubic-bezier(0.55, 0.06, 0.68, 0.19)';
  transform.value = 'scale(1.3)';

  setTimeout(() => {
    transition.value = '.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
    transform.value = '';
  }, 100);

  const MAX_TIMEOUT = 500;
  const started = Date.now();

  function animate() {
    const timePassed = Date.now() - started;

    if (timePassed >= MAX_TIMEOUT) {
      active = true;
      transform.value = '';
      transition.value = '';
      faceTransform.value = '';
      face.value = KAOMOJI_FACES.DEFAULT;
      inProgress = false;
      return;
    }

    const factor = (1 - (timePassed / MAX_TIMEOUT)) * 64;
    faceTransform.value = `translate(${(Math.random() - 0.5) * factor}px, ${(Math.random() - 0.5) * factor}px)`;
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

onMounted(() => {
  interval = setInterval(activity, 100);

  document.addEventListener('mousemove', mousemove);
  document.addEventListener('mouseout', mouseout);
  document.addEventListener('visibilitychange', mouseout);
  document.addEventListener('mouseenter', mouseenter);

  document.body.style.minWidth = '100vw';
  document.body.style.minHeight = '100vh';
});

onUnmounted(() => {
  clearInterval(interval);
  document.removeEventListener('mousemove', mousemove);
  document.removeEventListener('mouseout', mouseout);
  document.removeEventListener('visibilitychange', mouseout);
  document.removeEventListener('mouseenter', mouseenter);
});
</script>

<template lang="pug">
.button.secondary(v-ripple, @click="activate", @mousemove="faceMousemove")
  .container(:style="{ transform, transition }")
    .kaomoji--face(:style="{ transform: faceTransform }") {{ face }}
</template>

<style lang="scss" scoped src="@/assets/styles/components/kaomoji.scss"></style>