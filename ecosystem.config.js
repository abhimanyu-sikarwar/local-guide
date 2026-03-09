const argEnvIndex = process.argv.indexOf('--env')
let argEnv = (argEnvIndex !== -1 && process.argv[argEnvIndex + 1]) || ''

const RUN_ENV_MAP = {
  local: {
    instances: 1,
    max_memory_restart: '250M'
  },
  dev: {
    instances: 1,
    max_memory_restart: '250M'
  },
  prod: {
    instances: 1,
    max_memory_restart: '1000M'
  }
}

if (!(argEnv in RUN_ENV_MAP)) {
  argEnv = 'prod'
}

module.exports = {
  apps: [
    {
      name: 'local-guide-ui',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: RUN_ENV_MAP[argEnv].instances,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: RUN_ENV_MAP[argEnv].max_memory_restart,
      env_local: {
        APP_ENV: 'local'
      },
      env_dev: {
        APP_ENV: 'dev'
      },
      env_prod: {
        APP_ENV: 'prod',
        PORT: 6170
      }
    }
  ]
}
