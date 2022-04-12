<template>
  <div id="app">
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from "electron";
import Vue from "vue";

export default Vue.extend({
  name: "App",
  mounted() {
    document.title = "Operator"

    ipcRenderer.on("user:logged", () => {
      document.title = `Operator - ${localStorage.getItem("user:username")}`;
    });
    
  },
});
</script>

<style></style>
