// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation
const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10,}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// SKU validation
const isValidSKU = (sku) => {
  return sku && sku.length >= 5;
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidSKU,
};
