export default class DataManagerAbstract {
    constructor() {
        if (new.target === DataManagerAbstract) {
            throw new TypeError("Cannot construct Abstract instances directly")
        }
    }

    async createService({ name, description, environments }) {}

    async updateConfig(serviceId, environmentName, data) {}

    async getConfigs(serviceId, env) {}

    async getConfig(serviceId, env) {}

    async getAllEnv() {}
}