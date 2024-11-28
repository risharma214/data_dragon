const User = require('../models/User');

const handleUserAuth = async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: 'Email and name are required' });
        }

        let user = await User.findOne({ email });

        //user doesn't exist, create new user
        if (!user) {
            user = new User({
                email,
                name
            });
            await user.save();
        }

        res.json({
            userId: user._id,
            email: user.email,
            name: user.name
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

module.exports = {
    handleUserAuth
};
