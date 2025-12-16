module.exports = (requiredRole) => {
    return (req, res, next) => {
        if (!req.session.isLoggedIn || !req.session.userRole) {
            return res.status(401).redirect('/login');
        }

        if (req.session.userRole !== requiredRole) {
            console.log(`⚠️ Відмовлено в доступі: Користувач має роль ${req.session.userRole}, а потрібна ${requiredRole}`);
            return res.status(403).send('Доступ заборонено: у вас немає прав адміністратора.');
        }

        next();
    };
};
