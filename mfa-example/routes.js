const { json } = require('express');
const OAuth2Server = require('@node-oauth/oauth2-server');
const { Request, Response } = require('@node-oauth/oauth2-server');

const UserService = require('./UserService');
const TwoFactorService = require('./TwoFactorService');
const OAuthModel = require('./OAuthModel');

module.exports = app => {

    const oauth = new OAuth2Server({
        model: new OAuthModel(),
        grants: ['authorization_code'],
        allowEmptyState: true,
        requireClientAuthentication: { authorization_code: false }
    })

    app.use(json());

    /**
     * First we log the user to assure their credentials are valid, if they are, we dispatch our two factor request and send back their user id,
     * and the two factor number that was used masked (with *** on it). 
     */
    app.post('/api/login', (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = UserService.validateUsersCredentials(email, password);
            const twoFactorMaskedField = TwoFactorService.dispatchTwoFactor(user);
            req.session.userId = user;
            return res.json(twoFactorMaskedField);
        } catch (err) {
            return next(err);
        }
    });

    app.post('/api/authorize', async (req, res, next) => {
        if (!req.session.userId) {
            console.log("No session present.")
            return next(new Error("Invalid Credentials"));
        }
        try {
            const { two_factor_code, response_type, redirect_uri, client_id } = req.body;
            // doing the below add the appropriate OAuth2 RFC validation
            const request = new Request(req);
            const response = new Response(res);
            /**
             * The authenticateHandler gets the user by validating the two factor code with the assistance from the session,
             * once we have this user, can save the authorization code because we will have the user.
             */
            const options = {
                authenticateHandler: {
                    handle: data => {
                        return TwoFactorService.validateTwoFactorCode(data.session.userId, two_factor_code);
                    }
                }
            }
            const redirectUrlAndAuthCode = await oauth.authorize(request, response, options);
            return res.json({ redirectUrlAndAuthCode });
        } catch (err) {
            return next(err);
        }
    });
}
