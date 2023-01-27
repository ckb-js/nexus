export type Site = {
  name: string;
  url: string;
};

const siteService = {
  async getWhitelistSites(): Promise<Site[]> {
    return [
      {
        name: 'Google',
        url: 'https://www.google.com',
      },
      {
        name: 'Github',
        url: 'https://www.github.com',
      },
    ];
  },

  async removeSites(_site: Site): Promise<void> {
    //
  },
};

export default siteService;
