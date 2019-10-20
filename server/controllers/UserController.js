import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import emailSender from '../MailSender';
import Authentication from '../middleware/authentication';
import UserValidation from '../utils/userValidation';

const UserController = {
  /**
  * transformUser
  * @function
  * @param {object} user
  * @return {object} returns newUser
  */
 transformUser(user) {
   const newUser = {
     id: user.id,
     firstName: user.firstName,
     lastName: user.lastName,
     email: user.email,
     phoneNumber: user.phoneNumber,
     type: user.type,
     isActive: user.isActive,
   };
   return newUser;
 },

  /**
   * create User
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  createUser(req, res) {
    const { firstName, lastName, email, password, confirmPassword,
      phoneNumber, type } = req.body;
    const error = {...UserValidation.nameValidation(firstName, lastName),
    ...UserValidation.emailValidation(email),
    ...UserValidation.phoneNumberValidation(phoneNumber),
    ...UserValidation.passwordValidaton(password, confirmPassword)
  };

  if (Object.keys(error).length) {
    return res.status(400).json(error);
  }
  return User.findAll({
      where: { email }
    }).then((existingUser) => {
    if (existingUser.length > 0) {
      throw {status: 409, message: 'This email address has already been taken'};
    }
      return User
        .create({
          firstName, lastName, email, password, phoneNumber, type
          });
    }).then((newUser) => {
      return res.status(200).json({
        message: 'Signed up successfully',
        user: UserController.transformUser(newUser),
        token: Authentication.generateToken(newUser, true)
      });
    }).catch((error) => {
      const status = error.status || 500;
      const errorMessage = error.message || error;
      return res.status(status).json({ message: errorMessage});
    });
  },

  /**
   * social login
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  socialLogin(req, res) {
    const {lastName, firstName, email, id} = req.user;
    User.findOne({where: {email}})
    .then(user => {
      if (user) {
        throw {
          status: 400,
          message: "This email address has already been taken"
        };
      }
      return User.findOrCreate({where: {socialId: id},
        defaults: {
          lastName,
          firstName,
          email,
          isActive: true
        }});
    }).then(([user]) => {
        const token = Authentication.generateToken(user);
        return res.status(200).json({
          message: 'You are successfully Logged in',
          user: UserController.transformUser(user),
          token
        });
      }).catch((error) => {
        const status = error.status || 500;
        const errorMessage = error.message || error;
        return res.status(status).json({message: errorMessage});
      });
  },

  /**
   * activate User
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  activateUser(req, res) {
    User.findOne({
      where: { activationToken: req.query.token }
    })
    .then((userFound) => {
      if(!userFound || userFound.length === 0 ) {
        return res.status(404).json({ message: 'User not found'});
      }
      if (userFound.isActive) {
        return res.status(403).json({ message: 'User already Activated'});
      }

      return User.update({ isActive: true, activationToken: null }, {
        where: {
          activationToken: req.query.token
        }
      })
      .then(() => res.status(200).json({ message: 'User activation successful' }));
    })
    .catch((error) => {
      const errorMessage = error.message || error;
      return res.status(500).json({ message: errorMessage });
    });
  },

  /**
   * user login
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  userLogin(req, res) {
    const { email, password } = req.body;
    if(!email || !password) {
      return res.status(400).json({ message: 'Email and password cannot be empty'});
    }
    User.findOne({
      where: { email }
    })
    .then((user) => {
      if (user.length === 0 || !user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (!user.isActive) {
        return res.status(403).json({ message: 'User needs to activate account' });
      }
      if(!bcrypt.compareSync(password, user.password)) {
        return res.status(403).json({ message: "Incorrect login detail"});
      }
      else {
        const token = Authentication.generateToken(user);
        return res.status(200).json({
          message: 'You are successfully Logged in',
          user: UserController.transformUser(user),
          token
        });
      }
    })
    .catch(error => {
      return res.status(500).json({ error: error.message });
    });
  },

  /**
   * password reset
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  passwordReset(req, res) {
    const { email } = req.body;
    const host = req.headers.host;
    if (!email) {
      return res.status(400).json({ message: 'Email cannot be empty'});
    }

    User.findOne({
      where: { email }
    })
    .then((user) => {
      if(!user || user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      else {
        const title = 'Password Recovery | DUV LIVE';
        const resetToken = Authentication.generateToken(user);
        emailSender(email, resetToken, title, host).catch(console.error);
        return res.status(200).json({
          message: 'Password reset email sent successfully' });
      }
    })
    .catch(error => {
      return res.status(500).json({ error: error.message });
    });
  },

  /**
  * update password
  * @function
  * @param {object} req is req object
  * @param {object} res is res object
  * @return {object} returns res object
  */
  updatePassword(req, res) {
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill both fields, cannot be empty'});
    }

    const resetToken = req.query.token;
    jwt.verify(resetToken, process.env.SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).send({
          message: 'Invalid token',
        });
      }
      req.decoded = decoded;
    });

    User.findOne({
      where: { id: req.decoded.userId }
    })
    .then((user) => {
      if(!user || user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      if(password !== confirmPassword) {
        return res.status(403).json({ message: "Passwords do not match"});
      }

      return user.update({ password })
      .then(() => res.status(200).json({ message: 'Password update successful' }));
    })
    .catch(error => {
      return res.status(500).json({ error: error.message });
    });
  },

  /**
   *  user logout
   * @function
   * @param {object} req is request object
   * @param {object} res is response object
   * @return {undefined} returns undefined
   * */
  userLogout(req, res) {
    res.status(200).json({
      message: 'You have been Logged out',
    });
  },
};

export default UserController;
