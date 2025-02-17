window.app = () => {
  return {
    init() {},

    login() {
      const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
      location.href = `${baseUrl}/auth`;
    },

    logout() {
      auth.clear();
      location.reload();
    },
  };
};
