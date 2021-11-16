const users = require('./mock/dummy-users');

class UserService {
    constructor() {
        this.users = users;
    }

    getUserByEmail(email) {
        const user = this.users.find(user => user.email === email);
        if (!user) {
            console.error("User was not found!");
            // hint: don't throw not found, just pretend we couldn't find the user :) 
            throw new Error('Invalid credentials');
        }
        return user;
    }

    validateUsersCredentials(email, password) {
        const user = this.getUserByEmail(email);
        if (user.password === password) {
            return user;
        }
        console.error("User was password does not match!");
        throw new Error('Invalid credentials');
    }
}

module.exports = new UserService();
