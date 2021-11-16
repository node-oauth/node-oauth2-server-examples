const chance = require('chance')();
const UserService = require('./UserService');

class TwoFactorService {
    dispatchTwoFactor(authenticatingUser) {
        // challenge: we can go a step further and maybe have a property called "twoFactorType" and we dispatch two factor based on this setting.
        const twoFactorCode = chance.string({ length: 6, pool: '1234567890' }); // a little silly but just make SOME code up
        // (1), store this two factor code into the database, in this case in memory.
        for (let i = 0; i < UserService.users.length; i++) {
            // this here would be a DB query 
            const user = UserService.users[i];
            if (user.userId === authenticatingUser.userId) {
                authenticatingUser.twoFactorCode = twoFactorCode; // "store" the two factor code in the database
                UserService.users[i] = authenticatingUser; // to "store" it in memory
                console.log("The two factor code:", twoFactorCode);
                //(2a). when the user is found and we update the their two factor code in the db (which btw should be hashed), we send back the masked phone number that the code was sent too.
                return { field: user.phoneNumber.replace(/^.{8}/g, '*******') }; // challenge: do masking for email and phone numbers but better :) 
            }
        }
        // (2b) the user was NOT found, this is not good
        throw new Error('Invalid Credentials');
    }

    validateTwoFactorCode(userId, twoFactorCode) {
        // TODO: Implement
    }
}

module.exports = new TwoFactorService();
