function authenticateEmail(email: string) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email.match(regex)) {
    return false;
  }
  return true;
}



export { authenticateEmail };
