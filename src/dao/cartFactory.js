import config from "../config/config.js";

export let CartDao;

switch (config.persistence) {
    case 'mongodb':
        CartDao = (await import('./cartMongoDB.dao.js')).default;
        break;
    case 'memory':
        //CartDao = (await import('./memory')).default;
        break;
    default:
        CartDao = (await import('./cartMongoDB.dao.js')).default;
        break;
}
