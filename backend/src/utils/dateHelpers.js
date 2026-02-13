function calculateExpiryDate(minutes) {
    const now = new Date();
    return new Date(now.getTime() + minutes * 60000);
  }
  
  function isExpired(expiryDate) {
    return new Date() > new Date(expiryDate);
  }
  
  module.exports = { calculateExpiryDate, isExpired };