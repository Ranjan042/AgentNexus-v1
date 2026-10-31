import UserModel from '../schema/usermodel.js';
import { ensureDatabaseConnected } from '../config/database.js';

/**
 * Finds or creates a user account from a Google OAuth profile.
 *
 * @param {{ id: string, displayName?: string, emails?: Array<{ value: string }>, photos?: Array<{ value: string }> }} googleProfile
 * @returns {Promise<import('mongoose').Document>}
 */
export async function syncGoogleUser(googleProfile) {
  const { id, displayName, emails, photos } = googleProfile;
  const email = emails && emails[0] ? emails[0].value : null;
  const avatar = photos && photos[0] ? photos[0].value : null;

  if (!email) {
    throw new Error('Unable to retrieve email from Google profile.');
  }

  const isConnected = await ensureDatabaseConnected();
  if (!isConnected) {
    throw new Error('Database connection is temporarily unavailable.');
  }

  let user = await UserModel.findOne({ email });

  if (!user) {
    user = await UserModel.create({
      googleId: id,
      name: displayName || 'Nexus Developer',
      email,
      avatar,
    });
  } else {
    let updated = false;
    if (!user.googleId && id) {
      user.googleId = id;
      updated = true;
    }
    if (avatar && user.avatar !== avatar) {
      user.avatar = avatar;
      updated = true;
    }
    if (displayName && user.name !== displayName) {
      user.name = displayName;
      updated = true;
    }
    if (updated) {
      await user.save();
    }
  }

  return user;
}

/**
 * Finds user by ID without database version metadata.
 *
 * @param {string} userId
 * @returns {Promise<import('mongoose').Document|null>}
 */
export async function findUserById(userId) {
  return UserModel.findById(userId).select('-__v');
}
