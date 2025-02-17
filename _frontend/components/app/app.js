window.app = () => {
  return {
    init() {},

    login() {
      const clientId = env.MY_APP_CLIENT_ID; // Ensure this is set correctly
      const redirectUri = env.REDIRECT_URI; // Ensure this is set correctly
      const scope = env.GITHUB_AUTH_SCOPE; // Ensure this is set correctly

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope,
      });

      const authUrl = `${env.GITHUB_SITE_URL}/login/oauth/authorize?${params}`;

      console.log("Redirecting to:", authUrl); // Debugging line

      window.location.href = authUrl;
    },

    logout() {
      auth.clear();
      location.reload();
    },
  };
};
