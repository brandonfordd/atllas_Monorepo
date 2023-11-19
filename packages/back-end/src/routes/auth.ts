import IRoute from '../types/IRoute';
import {Router} from 'express';
import {compareSync} from 'bcrypt';
import { attachSession } from '../middleware/auth';
import {sequelize, Session, User} from '../services/db';
import {randomBytes} from 'crypto';
import bcrypt from 'bcrypt';

const AuthRouter: IRoute = {
  route: '/auth',
  router() {
    const router = Router();
    router.use(attachSession);

    // If we're authenticated, return basic user data.
    router.get('/', (req, res) => {
      if (req.session?.token?.id) {
        const {
          token: {token, ...session},
          user: {password, ...user},
        } = req.session;
        return res.json({
          success: true,
          message: 'Authenticated',
          data: {
            session,
            user,
          },
        });
      } else {
        return res.json({
          success: false,
          message: 'Not Authenticated',
        });
      }
    });

    // Attempt to log in
    router.post('/login', async (req, res) => {
      const {
        username,
        password,
      } = req.body;
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Missing username/password.',
        });
      }

      const user = await User.findOne({
        where: sequelize.where(
          sequelize.fn('lower', sequelize.col('username')),
          sequelize.fn('lower', username),
        ),
      }).catch(err => console.error('User lookup failed.', err));

      // Ensure the user exists. If not, return an error.
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username/password.',
        });
      }

      // Ensure the password is correct. If not, return an error.
      if (!compareSync(password, user.dataValues.password)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username/password.',
        });
      }

      // We now know the user is valid so it's time to mint a new session token.
      const sessionToken = randomBytes(32).toString('hex');
      let session;
      try {
        // Persist the token to the database.
        session = await Session.create({
          token: sessionToken,
          user: user.dataValues.id,
        });
      } catch (e) {
        return passError('Failed to create session.', e, res);
      }

      if (!session) {
        // Something broke on the database side. Not much we can do.
        return passError('Returned session was nullish.', null, res);
      }

      // We set the cookie on the response so that browser sessions will
      // be able to use it.
      res.cookie('SESSION_TOKEN', sessionToken, {
        expires: new Date(Date.now() + (3600 * 24 * 7 * 1000)), // +7 days
        secure: false,
        httpOnly: true,
      });

      // Log information before sending the response
      console.log('Cookie Set:', sessionToken);

      // We return the cookie to the consumer so that non-browser
      // contexts can utilize it easily. This is a convenience for the
      // take-home so you don't have to try and extract the cookie from
      // the response headers etc. Just know that this is a-standard
      // in non-oauth flows :)
      return res.json({
        success: true,
        message: 'Authenticated Successfully.',
        data: {
          token: sessionToken,
        },

        // Send user data as well as token to consumer
        user: {
          id: user.dataValues.id,
          username: user.dataValues.username,
          displayName: user.dataValues.displayName,
          registered:user.dataValues.registered
        },
      });
    });
    
    // Create a new user using the username and password from form
    router.post('/register', async (req, res) => {
      try {
        const { username, password } = req.body;
    
        //Check if form had a password and username
        if (!username || !password) {
          return res.status(400).json({
            success: false,
            message: 'Missing username/password.',
          });
        }
    
        // Check if the username is already taken
        const existingUser = await User.findOne({
          where: sequelize.where(
            sequelize.fn('lower', sequelize.col('username')),
            sequelize.fn('lower', username),
          ),
        });
    
        //Check for existing user so usernames are duplicated
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Username is already taken.',
          });
        }
    
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database
        const newUser = await User.create({
          username,
          password: hashedPassword,
          displayName: username, 
          // Set the registered field to the current date and time
          registered: new Date(), 
        });
    
        //Return user data once registered 
        return res.json({
          success: true,
          message: 'User registered successfully.',
          data: {
            user: {
              id: newUser.dataValues.id,
              username: newUser.dataValues.username,
              displayName: newUser.dataValues.displayName,
              registered: newUser.dataValues.registered,
            },
          },
        });
      } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error',
        });
      }
    });

    router.post('/logout', attachSession, async (req, res) => {
      try {

        // Assuming req.session.token.id contains the session ID
        console.log('Session Id:', req.session?.token?.id);
        const sessionId = req.session?.token?.id;

        //Check for a valid session ID, if none come back false
        if (!sessionId) {
          return res.status(400).json({
            success: false,
            message: 'Invalid session ID.',
          });
        }
    
        // Destroy the session on the server
        await Session.destroy({
          where: {
            id: sessionId,
          },
        });
    
        // Clear cookies on the client
        res.cookie('SESSION_TOKEN', '', {
          expires: new Date(0),  // Set the expiration date in the past
          secure: false,
          httpOnly: true,
          path: '/',
        });
    
        // Return a success response
        return res.json({
          success: true,
          message: 'Logged out successfully.',
        });
      } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error',
        });
      }
    });

    router.post('/update-display-name', async (req, res) => {
      try {
        const { displayName, userId } = req.body;

        console.log('Received data:', req.body);
        console.log('UserId:', userId);
        
        if (!userId || !displayName) {
          return res.status(400).json({
            success: false,
            message: 'Invalid request. Missing user ID or display name.',
          });
        }

        const updatedUser = await User.update(
          { displayName },
          { where: { id: userId } }
        );

        if (updatedUser[0] === 0) {
          return res.status(400).json({
            success: false,
            message: 'Failed to update display name. User not found.',
          });
        }

        return res.json({
          success: true,
          message: 'Display name updated successfully.',
          data: {
            user: {
              id: userId,
              displayName,
            },
          },
        });
      } catch (error) {
        console.error('Error updating display name:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error',
        });
      }
    });

    return router;
  },
};

export default AuthRouter;

function passError(message, error, response) {
  console.error(message, error);
  return response.status(500).json({
    success: false,
    message: `Internal: ${message}`,
  });
}
