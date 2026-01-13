import User from "../models/user.model";

async function saveUrl(optimizedUrl: string, userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    console.log("User not found");
    return 0;
  }
  user.avatar = optimizedUrl;
  await user.save();
  return 1;
}
export { saveUrl };
