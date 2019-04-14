
function handler(request, h) {
    return h.response('Hello');
}

module.exports = {
    path: '/',
    method: 'GET',
    handler
};