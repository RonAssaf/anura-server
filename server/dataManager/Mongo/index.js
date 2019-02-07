import mongoose from 'mongoose';
import { Service, Enviorment, Config } from './schemas';
import { config } from '../../constants/configs'
import DataManagerAbstract from '../DataMangerAbstract';


export default class MongoManager extends DataManagerAbstract {
    constructor(connectionString = config.MONGO_STORE) {
        super()
        this.connectionString = connectionString
        mongoose.connect(this.connectionString)
        mongoose.connection.on('error', console.error.bind(console, 'connection error:'))
    }

    async createService({ name, description, environments }) {
        let promises = []
        for (let enviorment of environments) {
            promises.push(this._createEnviorment(enviorment))
        }

        let newEnvironments = await Promise.all(promises)
        var service = new Service({
            name: name,
            description: description,
            environments: newEnvironments.map(env => env._id)
        })
        return service.save()
    }

    async updateConfig(serviceId, environmentName, data) {
        const service = await this._findService(serviceId, environmentName)
        let enviorment = await Enviorment.findById(service.environments[0].id).exec()
        let newConfig = new Config({
            data: data,
            version: enviorment.configs.length
        })
        newConfig = await newConfig.save()
        enviorment.configs.push(newConfig.id)
        return enviorment.save()
    }

    async getConfigs(serviceId, env) {
        const service = await Service
            .find({
                _id: mongoose.Types.ObjectId(serviceId)
            })
            .populate({
                path: 'environments',
                populate: {
                    path: 'configs'
                },
                match: {
                    name: env
                }
            })
            .exec()
        return {
            name: service[0].environments[0].name,
            configs: service[0].environments[0].configs
        }
    }

    async getConfig(serviceId, env) {
        const allConfigs = await this.getConfigs(serviceId, env)
        return allConfigs.configs.sort(item => item.version).slice(-1)[0].data
    }

    async getAllEnv() {
        return Service.find({})
            .populate({
                path: 'environments',
                populate: {
                    path: 'configs'
                }
            })
            .exec();
    }

    async updateService(serviceId, { name, description, environments}) {
        debugger;
        let service = await Service.findById(serviceId).populate({
            path: 'environments',
            populate: {
                path: 'configs'
            }
        }).exec()
        service.name = name
        service.description = description
        for(let enviorment of environments) {
            if(service.environments.find(e => e.name === enviorment.name)) {
                this._updateEnvironment(enviorment.id, { name: enviorment.name, configs: []})
            } else{ 
                const newEnviorment = this._createEnviorment(enviorment)
                service.environments.push(newEnviorment._id)
            }
        }
        return service.save()
    }

    //#region privates

    async _createEnviorment({ name, config }) {
        let newConfig = await this._createConfig(config)

        let enviorment = new Enviorment({
            name: name,
            configs: [newConfig._id]
        })

        return enviorment.save()
    }

    async _createConfig({ data, key }) {
        let config = new Config({
            data: data,
            version: key || 0
        })
        return config.save()
    }

    async _findService(serviceId, environmentName) {
        return Service
            .findOne({
                _id: mongoose.Types.ObjectId(serviceId)
            })
            .populate({
                path: 'environments',
                match: {
                    name: environmentName
                }
            })
            .exec()
    }

    async _updateEnvironment(enviormentId, { name, configs}) {
        let enviorment = await Enviorment.findById(enviormentId)
        debugger;
        enviorment.name = name
        return enviorment.save()
    }

    //#endregion
}