const User = require('../models/user'); 
const bcrypt = require('bcryptjs'); 

exports.redirectIfLoggedIn = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/notes'); 
    }
    next();
};

exports.getRegister = (req, res, next) => {
    res.render('register', {
        pageTitle: 'Реєстрація',
        errorMessage: null,
        username: '',
        email: ''
    });
};

exports.postRegister = async (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password || password.length < 6) {
        return res.render('register', {
            pageTitle: 'Реєстрація',
            errorMessage: 'Будь ласка, заповніть усі поля. Пароль має бути не менше 6 символів.',
            username, email
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', {
                pageTitle: 'Реєстрація',
                errorMessage: 'Користувач з таким email вже зареєстрований.',
                username, email
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12); 
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: 'user'
        });

        await user.save();
        
        req.session.isLoggedIn = true;
        req.session.userId = user._id.toString();
        req.session.userRole = user.role;

        req.session.save(err => {
            res.redirect('/notes'); 
        });
    } catch (err) {
        console.error(err);
        res.render('register', { pageTitle: 'Реєстрація', errorMessage: 'Помилка сервера.', username, email });
    }
};

exports.getLogin = (req, res, next) => {
    res.render('login', {
        pageTitle: 'Вхід',
        errorMessage: null,
        email: ''
    });
};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { pageTitle: 'Вхід', errorMessage: 'Неправильний email або пароль.', email });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { pageTitle: 'Вхід', errorMessage: 'Неправильний email або пароль.', email });
        }

        req.session.isLoggedIn = true;
        req.session.userId = user._id.toString();
        req.session.userRole = user.role;

        req.session.save(err => {
            console.log('Вхід успішний. Роль:', user.role);
            res.redirect('/notes'); 
        });
    } catch (err) {
        console.error(err);
        res.render('login', { pageTitle: 'Вхід', errorMessage: 'Помилка сервера.', email });
    }
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/'); 
    });
};

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password'); 
        res.render('users', {
            pageTitle: 'Список користувачів (Адмін)',
            users: users.map(user => ({
                ...user._doc,
                createdAt: user.createdAt.toLocaleDateString('uk-UA')
            })),
            hasUsers: users.length > 0
        });
    } catch (err) {
        res.render('users', { pageTitle: 'Список користувачів', errorMessage: 'Помилка завантаження.' });
    }
};
