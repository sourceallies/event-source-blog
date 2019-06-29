const getAccountById = require('./getAccountById');

async function handler(request, h) {
    const account = await getAccountById(request.params.accountId);
    if (!account) {
        return h.response().code(404);
    }
    return h.response(account);
}

module.exports = {
    handler,
    method: 'GET',
    path: '/accounts/{accountId}',
};