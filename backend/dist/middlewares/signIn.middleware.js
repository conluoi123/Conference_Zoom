"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateEmail = authenticateEmail;
function authenticateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.match(regex)) {
        return false;
    }
    return true;
}
//# sourceMappingURL=signIn.middleware.js.map