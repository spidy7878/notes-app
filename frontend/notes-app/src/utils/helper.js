export const  validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);  
};

// utils/helper.js
export const getInitials = (fullName) => {
    if (!fullName) return '';
    const names = fullName.split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
    return initials;
  };
  