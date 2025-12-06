const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

const dataPath = path.resolve(__dirname, '..', 'data.json');
let userData = {};
try {
  if (fs.existsSync(dataPath)) {
    const data = fs.readFileSync(dataPath, 'utf8');
    userData = JSON.parse(data || '{}');
  } else {
    userData = {};
  }
} catch (err) {
  console.error('Failed to load data.json:', err);
  userData = {};
}

const saltRounds = process.env.SALT_ROUNDS || 10;
const jwtSecret = process.env.JWT_SECRET || 'super_strong_64char';


const registerUser = async (user) => {
    try {
        if (userData[user.email]) {
            return {
                success: false,
                status: 400,
                message: 'User already exists'
            };
        }
        const hashedPassword = await bcrypt.hash(user.password, parseInt(saltRounds));
        userData[user.email] = {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            preferences: user.preferences || []
        };
        return {
            success: true,
            status: 200,
            message: 'User registered successfully'
        };
    } catch (err) {
        console.error('registerUser error:', err);
        return {
            success: false,
            status: 500,
            message: 'Error registering user'
        };
    }
};

const loginUser = async (user) => {
    const storedUser = userData[user.email];
    if (!storedUser) {
        return {
            success: false,
            status: 404,
            message: 'User not found'
        };
    }
    try {
        const match = await bcrypt.compare(user.password, storedUser.password);
        if (match) {
            const token = jwt.sign(
                {
                    email: user.email
                },
                jwtSecret,
                { expiresIn: '1h' }
            );
            return {
                success: true,
                status: 200,
                message: 'Login successful',
                token: token
            };
        } else {
            return {
                success: false,
                status: 401,
                message: 'Invalid username or password'
            };
        }
    } catch (err) {
        console.error('loginUser error:', err);
        return {
            success: false,
            status: 500,
            message: 'Error during login'
        };
    }
};

const getUserPreferences = (username) => {
    try {
        const user = userData[username];
        if (!user) {
            return {
                success: false,
                status: 404,
                message: 'User not found'
            };
        }
        return {
            success: true,
            status: 200,
            preferences: user.preferences
        };
    } catch (err) {
        console.error('getUserPreferences error:', err);
        return {
            success: false,
            status: 500,
            message: 'Error fetching preferences'
        };
    }   
};

const updateUserPreferences = (username, preferences) => {
    try {
        const user = userData[username];
        if (!user) {
            return {
                success: false,
                status: 404,
                message: 'User not found'
            };
        }
        if (!Array.isArray(preferences)) {
            return {
                success: false,
                status: 400,
                message: "Preferences must be an array"
            };
        }
        user.preferences = [...preferences];
        return {
            success: true,
            status: 200,
            message: 'Preferences updated successfully',
            data: {"preferences": user.preferences}
        };
    } catch (err) {
        console.error('updateUserPreferences error:', err);
        return {
            success: false,
            status: 500,
            message: 'Error updating preferences'
        };
    }   
};

module.exports = { registerUser, loginUser, getUserPreferences, updateUserPreferences };