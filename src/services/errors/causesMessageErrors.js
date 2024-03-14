export const generateProductError = (product) => {
    return `Todos los campos son requeridos y deben ser validos.
    Lista de campos recibidos en la solicitud:
      - title       : ${product.title}
      - description : ${product.description}
      - code        : ${product.code}
      - price       : ${product.price}
      - status      : ${product.status}
      - stock       : ${product.stock}
      - category    : ${product.category}
      - thumbnail   : ${product.thumbnail}
      - availability: ${product.availability}
      `;
  };
  
  export const generateCartError = (cart) => {
    return `Se produjo un error al agregar el producto al carrito.
    Detalles del producto:
      - productId : ${cart.productId}
      - title     : ${cart.title}
      - price     : ${cart.price}
      - quantity  : ${cart.quantity}
      `;
  };
  