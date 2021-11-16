const users = [
    {
        "userId": 1,
        "firstName": "Daniel",
        "email": "daniel@gmail.com",
        "lastName": "R.",
        "twoFactorCode": "",
        "phoneNumber": "123-123-1234",
        "password": "password", // obviously we hash and salt but this is just an example anyways
        "grantType": [
            "authorization_code"
        ],
        "authorizationCode": "",
        "accessToken": ""
    }
]

module.exports = users;
