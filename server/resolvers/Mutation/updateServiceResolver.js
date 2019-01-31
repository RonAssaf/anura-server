import dataManager from '../../dataManager/index'

export default function (obj, args) {
    try {
        const { serviceId, service } = args
        dataManager.manager.updateService(serviceId, service)
        return {
            success: true
        };
    } catch (e) {
        return {
            success: false,
            error: e.message
        };
    }

}