import YAML from 'yamljs';
import path from 'path';

class ConfigManager {
  config: any;

  constructor() {
    this.config = YAML.load(path.join(process.cwd(), './config.yml'));  

    console.info('Config ->', JSON.stringify(this.config, null, 2));
  }

  get(key: string){
    if(this.config[key]){
      return this.config[key];
    }

    return {};
  }

  getPluginConfig(pluginName: string){
    const pluginsConfig = this.get('plugins');

    if(pluginsConfig[pluginName]){
      return pluginsConfig[pluginName];
    }

    return {};
  }
}

const Config = new ConfigManager();
export default Config;