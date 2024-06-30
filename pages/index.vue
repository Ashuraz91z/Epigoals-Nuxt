<template>
  <div :class="{ dark: isDarkMode }">
    <button
      @click="toggleTheme"
      class="border-2 border-black rounded-md m-2 dark:bg-black dark:text-white"
    >
      Button
    </button>
    <h1 class="text-blue-100 dark:text-red-800">Test</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isDarkMode: false,
    };
  },
  methods: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
    },
  },
};
</script>

<style scoped>
.dark {
  background-color: black;
  color: white;
}
</style>
