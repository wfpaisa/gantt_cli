<template>
  <div id="app">
    <tasks />
  </div>
</template>

<script>
import Tasks from './components/Tasks.vue';

export default {
  name: 'App',
  components: {
    Tasks,
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
