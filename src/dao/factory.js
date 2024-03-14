import config from "../config/config.js"

export let ProductDao;

switch (config.persistence){
    case 'mongodb':
        ProductDao = (await import('./productMongoDB.dao.js')).default;
        break;
    default:
        ProductDao = (await import('./')).default;  //url de memory u otra
        break;
}