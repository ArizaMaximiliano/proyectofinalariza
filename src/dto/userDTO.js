export default class UserDTO {
    constructor(user) {
        this.id = user._id;
        this.name = `${user.firstName} ${user.lastName}`;
        this.email = user.email;
        this.age = user.age;
        this.role = user.role;
        this.cartID = user.cartID;
        this.last_connection = user.last_connection;
    }
}
