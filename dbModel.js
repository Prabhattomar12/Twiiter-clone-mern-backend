import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
  displayName: String,
  username: String,
  avatar: String,
  text: String,
  image: String,
  verified: Boolean,
});

export default mongoose.model('posts', postSchema);
