module.exports = {
  apps: [{
    name: "backend",
    script: "./build/app.js",
    cwd: ".",
    watch: ["build"],
    watch_delay: 1000,
    env: {
      "PORT": 9000
    },
    max_memory_restart: '600M'
  }],

}
