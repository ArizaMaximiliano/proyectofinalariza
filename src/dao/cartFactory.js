import config from "../config/config.js";

export let CartDao;

switch (config.persistence) {
    case 'mongodb':
        CartDao = (await import('./cartMongoDB.dao.js')).default;
        break;
    default:
        CartDao = (await import('./ponerurl')).default;  //url de memory u otra
        break;
}
