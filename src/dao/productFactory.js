import config from "../config/config.js"

export let ProductDao;

switch (config.persistence) {
    case 'mongodb':
        ProductDao = (await import('./productMongoDB.dao.js')).default;
        break;
    case 'memory':
        //ProductDao = (await import('./memory')).default;
        break;
    default:
        ProductDao = (await import('./productMemory.dao.js')).default;
        break;
}
