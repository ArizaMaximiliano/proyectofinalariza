import ProductModel from './models/productModel.js';

export default class ProductDAO {
    getAll(criteria = {}) {
        return ProductModel.find(criteria);
    }

    getById(id) {
        return ProductModel.findById(id);
    }

    create(data) {
        return ProductModel.create(data);
    }

    updateById(id, data) {
        const criteria = { _id: id };
        const operation = { $set: data };
        return ProductModel.updateOne(criteria, operation);
    }

    deleteById(id) {
        const criteria = { _id: id };
        return ProductModel.deleteOne(criteria);
    }
}
