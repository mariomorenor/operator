<template>
  <div>
    <div>
      <label for="">Usuario</label>
      <input type="text" v-model="username" />
    </div>
    <div>
      <label for="">Contraseña</label>
      <input type="text" v-model="password" />
    </div>
    <div>
      <button @click="login()">INGRESAR</button>
    </div>
  </div>
</template>

<script lang="ts">
import {  ipcRenderer } from "electron";
import { dialog, BrowserWindow } from "@electron/remote";
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    login() {
      if (this.username == "admin" && this.password == "admin") {
        localStorage.setItem("user:username",this.username);
        ipcRenderer.send("login_successful");
      } else {
        
        // @ts-ignore-check
        dialog.showMessageBox(BrowserWindow.getFocusedWindow(),{
          message: "Credenciales Inválidas",
          type:"error",
          title:BrowserWindow.getFocusedWindow()?.getTitle()
        });
      }
    },
  },
});
</script>
