const User = require('../models/User');

const handleUserAuth = async (req, res) => {
    console.log('Auth request received:', {
        body: req.body,
        headers: req.headers
    });

    try {
        const { email, name } = req.body;
        console.log('Attempting to authenticate user:', { email, name });

        // Check if user exists
        let user = await User.findOne({ email });
        console.log('Database lookup result:', user);

        // If user doesn't exist, create new user
        if (!user) {
            console.log('Creating new user');
            user = new User({
                email,
                name
            });
            await user.save();
            console.log('New user created:', user);
        }

        // Return user details
        res.json({
            userId: user._id,
            email: user.email,
            name: user.name
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

module.exports = {
    handleUserAuth
};
