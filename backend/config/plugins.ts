export default () => ({
  'users-permissions': {
    config: {
      register: {
        allowedFields: ['email', 'password'],
        requiredFields: ['email', 'password'],
      },
      jwt: {
        expiresIn: '7d',
      },
    },
  },
});
