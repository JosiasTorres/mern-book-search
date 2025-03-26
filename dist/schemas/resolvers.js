import { AuthenticationError } from 'apollo-server-express';
import User from '../models/User';
import { signToken } from '../middleware/auth';
export const resolvers = {
    Query: {
        me: async (_parent, _args, context) => {
            if (!context.user) {
                throw new AuthenticationError('You must be logged in');
            }
            return User.findById(context.user._id);
        },
    },
    Mutation: {
        login: async (_parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user || !(await user.isCorrectPassword(password))) {
                throw new AuthenticationError('Invalid credentials');
            }
            const token = signToken(user.username, user.email, user._id.toString());
            return { token, user };
        },
        addUser: async (_parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user.username, user.email, user._id.toString());
            return { token, user };
        },
        saveBook: async (_parent, { bookData }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You must be logged in');
            }
            return User.findByIdAndUpdate(context.user._id, { $push: { savedBooks: bookData } }, { new: true });
        },
        removeBook: async (_parent, { bookId }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You must be logged in');
            }
            return User.findByIdAndUpdate(context.user._id, { $pull: { savedBooks: { bookId } } }, { new: true });
        },
    },
};
