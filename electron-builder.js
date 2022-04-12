/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  appId: "com.jmoreno.operator",
  win: {
    target: "portable",
    icon: "public/icon.png",
  },
};
