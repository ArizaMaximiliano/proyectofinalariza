export default class ProductDTO {
    constructor(product) {
        this.title = product.title || '';
        this.description = product.description || '';
        this.code = product.code || '';
        this.price = product.price || 0;
        this.status = product.status || '';
        this.stock = product.stock || 0;
        this.category = product.category || '';
        this.thumbnail = product.thumbnail || '';
        this.availability = product.availability || false;
        this.owner = product.owner || 'admin'; 
    }
}