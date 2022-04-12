const { defineConfig } = require("@vue/cli-service");
const publicTemplate = "public/index.html";
module.exports = defineConfig({
  lintOnSave: false,
  pages: {
    index: {
      entry: "src/main",
      template: publicTemplate,
    },
    login: {
      entry: "src/views/Login/login",
      template: publicTemplate,
    },
    historial:{
      entry:"src/views/History/history",
      template: publicTemplate,
    }
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
    },
  },
});
