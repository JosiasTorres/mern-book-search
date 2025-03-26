import { AuthenticationError } from 'apollo-server-express';
import User from '../models/User';
import { signToken } from '../middleware/auth';

interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  isCorrectPassword: (password: string) => Promise<boolean>;
}

interface Context {
  user?: IUser;
}

export const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return User.findById(context.user._id);
    },
  },

  Mutation: {
    login: async (_parent: unknown, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email }) as IUser | null;
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Invalid credentials');
      }
      const token = signToken(user.username, user.email, user._id.toString());
      return { token, user };
    },

    addUser: async (_parent: unknown, { username, email, password }: { username: string; email: string; password: string }) => {
      const user = await User.create({ username, email, password }) as IUser;
      const token = signToken(user.username, user.email, user._id.toString());
      return { token, user };
    },

    saveBook: async (_parent: unknown, { bookData }: { bookData: any }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return User.findByIdAndUpdate(
        context.user._id,
        { $push: { savedBooks: bookData } },
        { new: true }
      );
    },

    removeBook: async (_parent: unknown, { bookId }: { bookId: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    },
  },
};